/* * ESTE É O NOSSO PRIMEIRO "ROBÔ" BACKEND (Função Serverless)
 * Nome: login.js
 * Objetivo: Receber dados do formulário, checar se o usuário existe no Supabase,
 * e se não existir, criá-lo.
 */

// Esta é a "ferramenta" oficial do Supabase para o Backend.
// O Netlify vai instalar isso por causa do nosso 'package.json'
const { createClient } = require('@supabase/supabase-js');

// O "coração" do nosso robô
exports.handler = async function(event, context) {
    
    // 1. Pega as "senhas" que você configurou no Netlify
    const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;

    // 2. Conecta ao Supabase usando a senha-mestra
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // 3. Pega os dados que o formulário de login enviou (Nome, Email, etc.)
    const { nome, email, whatsapp } = JSON.parse(event.body);

    if (!email) {
        return {
            statusCode: 400, // Erro "Bad Request"
            body: JSON.stringify({ erro: 'E-mail é obrigatório.' })
        };
    }

    try {
        // 4. PROCURA no banco de dados se o e-mail já existe
        let { data: usuarioExistente, error: selectError } = await supabase
            .from('usuarios') // O nome da tabela que C-R-I-A-M-O-S
            .select('id, email, creditos') // Pega os dados dele
            .eq('email', email) // 'eq' significa 'equals' (igual a)
            .single(); // Pega só um resultado

        let usuarioFinal = usuarioExistente;

        // 5. SE NÃO EXISTIR, CRIA UM NOVO
        if (!usuarioExistente) {
            console.log(`Usuário não encontrado. Criando novo usuário para: ${email}`);
            
            const { data: novoUsuario, error: insertError } = await supabase
                .from('usuarios')
                .insert([
                    { 
                        nome: nome, 
                        email: email, 
                        whatsapp: whatsapp,
                        // 'creditos: 0' é automático por causa do "Default Value"
                    }
                ])
                .select('id, email, creditos') // Pega os dados do usuário recém-criado
                .single();

            if (insertError) {
                throw insertError; // Joga o erro para o 'catch'
            }
            
            usuarioFinal = novoUsuario;
            console.log('Novo usuário criado:', usuarioFinal);
            
        } else {
            console.log('Usuário já existe (bem-vindo de volta):', usuarioFinal);
        }

        // 6. RESPONDE "SUCESSO" para o Frontend
        // Envia de volta os dados do usuário (especialmente os créditos)
        return {
            statusCode: 200,
            body: JSON.stringify(usuarioFinal) // Envia o usuário (id, email, creditos)
        };

    } catch (error) {
        console.error('Erro no Supabase:', error.message);
        // Responde "ERRO" para o Frontend
        return {
            statusCode: 500,
            body: JSON.stringify({ erro: error.message })
        };
    }
};