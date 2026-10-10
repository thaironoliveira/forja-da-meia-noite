const btnsPagamento = document.querySelectorAll('.btn-pagar');
        const msgStatus = document.getElementById('msgStatus');
        const emailUsuario = localStorage.getItem('usuario_email');

        // ** A CURA DO BOTÃO PRESO **
        window.addEventListener('pageshow', function(event) {
            btnsPagamento.forEach(b => b.disabled = false);
            msgStatus.textContent = '';
        });

        if (!emailUsuario) {
            msgStatus.style.color = '#FF5555';
            msgStatus.textContent = 'Erro: Usuário não encontrado. Faça login novamente.';
            btnsPagamento.forEach(b => b.disabled = true);
        }

        btnsPagamento.forEach(botao => {
            botao.addEventListener('click', async () => {

                const planoId = botao.dataset.planoId;

                btnsPagamento.forEach(b => b.disabled = true);
                msgStatus.style.color = '#D4AF37';
                msgStatus.textContent = 'Conectando ao Mercado Pago...';

                try {
                    const response = await fetch('/.netlify/functions/criar-pagamento', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: emailUsuario,
                            planoId: planoId
                        })
                    });

                    const data = await response.json();
                    if (!response.ok) { throw new Error(data.erro || 'Falha ao criar link de pagamento.'); }

                    msgStatus.textContent = 'Redirecionando para o pagamento...';
                    window.location.href = data.link_pagamento;

                } catch (error) {
                    msgStatus.style.color = '#FF5555';
                    msgStatus.textContent = error.message;
                    btnsPagamento.forEach(b => b.disabled = false);
                }
            });
        });
