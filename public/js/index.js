      let falaAtual = null;

      function iniciarLeitura() {
        speechSynthesis.cancel();
        const texto = document.body.innerText;

        falaAtual = new SpeechSynthesisUtterance(texto);
        falaAtual.lang = "pt-BR";
        falaAtual.rate = 1;
        falaAtual.pitch = 1;

        speechSynthesis.speak(falaAtual);
      }

      function pausarLeitura() {
        if (speechSynthesis.speaking && !speechSynthesis.paused) {
          speechSynthesis.pause();
        }
      }

      function continuarLeitura() {
        if (speechSynthesis.paused) {
          speechSynthesis.resume();
        }
      }

      function pararLeitura() {
        speechSynthesis.cancel();
      }

      document.getElementById("audio-start").addEventListener("click", iniciarLeitura);
      document.getElementById("audio-pause").addEventListener("click", pausarLeitura);
      document.getElementById("audio-resume").addEventListener("click", continuarLeitura);
      document.getElementById("audio-stop").addEventListener("click", pararLeitura);