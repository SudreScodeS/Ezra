from flask import Flask, request, jsonify
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json

    user_profile = f"{' '.join(data['skills'])} {data['experiencia']}"
    jobs = data['vagas']

    corpus = [user_profile] + [f"{j['titulo']} {j['descricao']} {' '.join(j['requisitos'])}" for j in jobs]
    tfidf = TfidfVectorizer().fit_transform(corpus)
    similarities = cosine_similarity(tfidf[0:1], tfidf[1:]).flatten()

    resultados = sorted(zip(jobs, similarities), key=lambda x: x[1], reverse=True)

    explicacao = f"A vaga mais compatível é '{resultados[0][0]['titulo']}' com {round(resultados[0][1]*100, 1)}% de compatibilidade."

    return jsonify({
        "explicacao": explicacao,
        "recomendacoes": [
            {
                "titulo": r[0]["titulo"],
                "descricao": r[0]["descricao"],
                "requisitos": r[0]["requisitos"],
                "compatibilidade": round(r[1]*100, 1)
            } for r in resultados
        ]
    })

if __name__ == '__main__':
    app.run(port=5000, debug=True)
