from flask import Flask, request, jsonify
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import logging

app = Flask(__name__)
logging.basicConfig(level=logging.DEBUG)

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        print("=== PYTHON IA SERVICE STARTED ===")
        print("📥 Received request")

        data = request.json
        if not data:
            print("❌ No JSON data received")
            return jsonify({"error": "No JSON data"}), 400

        # ✓ Validate required fields
        if 'skills' not in data or 'experiencia' not in data or 'vagas' not in data:
            print("❌ Missing required fields")
            return jsonify({"error": "Missing required fields: skills, experiencia, vagas"}), 400

        skills = data['skills']
        experiencia = data['experiencia']
        jobs = data['vagas']

        print(f"📊 Received data:")
        print(f"   Skills type: {type(skills)}, value: {skills}")
        print(f"   Experiencia type: {type(experiencia)}, value: {experiencia}")
        print(f"   Jobs count: {len(jobs) if isinstance(jobs, list) else 'NOT A LIST'}")

        # ✓ Validate data types and handle conversions
        if isinstance(skills, list):
            skills_str = ' '.join([str(s).strip() for s in skills if s])
        elif isinstance(skills, str):
            skills_str = skills.strip()
        else:
            skills_str = str(skills).strip() if skills else ''

        if isinstance(experiencia, str):
            experiencia_str = experiencia.strip()
        else:
            experiencia_str = str(experiencia).strip() if experiencia else ''

        if not isinstance(jobs, list):
            print("❌ Vagas must be a list")
            return jsonify({"error": "Vagas must be a list"}), 400

        if len(jobs) == 0:
            print("❌ No jobs provided")
            return jsonify({"error": "No jobs to recommend"}), 400

        print(f"✓ Processed skills: '{skills_str}'")
        print(f"✓ Processed experiencia: '{experiencia_str}'")

        # ✓ Build user profile
        user_profile = f"{skills_str} {experiencia_str}".strip()

        if not user_profile:
            print("⚠️ User profile is empty")
            user_profile = "sem informações"

        print(f"✓ User profile built: '{user_profile}'")

        # ✓ Build corpus with validation
        corpus = [user_profile]
        for i, j in enumerate(jobs):
            try:
                titulo = str(j.get('titulo', '')).strip()
                descricao = str(j.get('descricao', '')).strip()
                requisitos = j.get('requisitos', [])

                if isinstance(requisitos, list):
                    requisitos_str = ' '.join([str(r).strip() for r in requisitos if r])
                else:
                    requisitos_str = str(requisitos).strip() if requisitos else ''

                job_text = f"{titulo} {descricao} {requisitos_str}".strip()

                if not job_text:
                    job_text = f"Job {i+1}"

                corpus.append(job_text)
            except Exception as e:
                print(f"⚠️ Error processing job {i}: {str(e)}")
                corpus.append(f"Job {i+1}")

        print(f"✓ Corpus built with {len(corpus)} documents (1 user + {len(jobs)} jobs)")

        # ✓ TF-IDF with robust settings
        try:
            tfidf = TfidfVectorizer(
                lowercase=True,
                stop_words=None,
                min_df=1,
                max_features=None
            ).fit_transform(corpus)
            print(f"✓ TF-IDF vectorization successful, shape: {tfidf.shape}")
        except Exception as e:
            print(f"❌ TF-IDF error: {str(e)}")
            return jsonify({"error": f"TF-IDF vectorization failed: {str(e)}"}), 500

        # ✓ Cosine similarity
        try:
            similarities = cosine_similarity(tfidf[0:1], tfidf[1:]).flatten()
            print(f"✓ Cosine similarity calculated: {len(similarities)} scores")
            print(f"   Scores: {similarities}")
        except Exception as e:
            print(f"❌ Cosine similarity error: {str(e)}")
            return jsonify({"error": f"Similarity calculation failed: {str(e)}"}), 500

        # ✓ Sort results
        resultados = sorted(zip(jobs, similarities), key=lambda x: x[1], reverse=True)

        # ✓ Build explanation
        if resultados and resultados[0][1] > 0:
            explicacao = f"A vaga mais compatível é '{resultados[0][0].get('titulo', 'Unknown')}' com {round(resultados[0][1]*100, 1)}% de compatibilidade."
        else:
            explicacao = "Não foram encontradas vagas muito compatíveis com seu perfil. Recomendamos revisar suas skills ou experiência."

        print(f"✓ Top result: {explicacao}")
        print("=== PYTHON IA SERVICE SUCCESS ===")

        return jsonify({
            "explicacao": explicacao,
            "recomendacoes": [
                {
                    "titulo": r[0].get("titulo", "Unknown"),
                    "descricao": r[0].get("descricao", ""),
                    "requisitos": r[0].get("requisitos", []),
                    "compatibilidade": round(r[1]*100, 1)
                } for r in resultados
            ]
        })

    except Exception as e:
        print(f"❌ UNEXPECTED ERROR: {str(e)}")
        print(f"Stack trace:", exc_info=True)
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "Python IA service is running"}), 200

if __name__ == '__main__':
    print("\n" + "="*50)
    print("🚀 Starting Python IA Service on port 5000")
    print("="*50 + "\n")
    app.run(host='127.0.0.1', port=5000, debug=True)
