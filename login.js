const loginForm = document.getElementById('loginForm');
        const btnLogin = document.getElementById('btnLogin');
        const formMensagem = document.getElementById('formMensagem');
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const nome = document.getElementById('nome').value;
            const email = document.getElementById('email').value;
            const whatsapp = document.getElementById('whatsapp').value;
            if (!email) {
                formMensagem.style.color = '#FF5555';
                formMensagem.textContent = 'Por favor, insira seu e-mail.';
                return;
            }
            btnLogin.disabled = true;
            btnLogin.textContent = 'Carregando...';
            formMensagem.textContent = '';
            try {
                const response = await fetch('/.netlify/functions/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome, email, whatsapp })
                });
                const data = await response.json();
                if (!response.ok) { throw new Error(data.erro || 'Falha ao fazer login.'); }
                formMensagem.style.color = '#D4AF37';
                formMensagem.textContent = 'Sucesso! Redirecionando...';
                localStorage.setItem('usuario_email', data.email);
                localStorage.setItem('usuario_creditos', data.creditos);
                setTimeout(() => {
                    window.location.href = 'gerador.html';
                }, 1000);
            } catch (error) {
                formMensagem.style.color = '#FF5555';
                formMensagem.textContent = error.message;
                btnLogin.disabled = false;
                btnLogin.textContent = 'Acessar o Gerador';
            }
        });
