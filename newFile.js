import { PORT } from '.';

ACESSO-- >
  <div id="loginSection" style="max-width: 400px; margin: 60px auto; width: 100%;">
    <div class="card" style="text-align: center;">
      <div style="width: 180px; height: 120px; margin: 0 auto 15px auto; overflow: hidden; display: flex; align-items: center; justify-content: center;">
        <video id="logoVideo" style="width:100%; height:100%; object-fit:cover;" src="animação logo.mp4" muted playsinline></video>
      </div>
      <h2 id="loginTitle" style="color: var(--primary-color); font-size: 18px; margin-bottom: 15px;">Adorê Adm</h2>

      < />!-- Formulário unificado (Login / Registo) -->
      <form id="loginForm">
        <label>E-mail</label>
        <input type="email" id="loginEmail" name="email_admin" autocomplete="off" required placeholder="admin@adore.com">

          <label>Senha</label>
          <input type="password" id="loginSenha" name="senha_admin" autocomplete="new-password" required placeholder="Sua senha">

            <button type="submit" id="btnSubmitLogin" class="action-btn" style="padding: 12px; margin-top: 10px; width: 100%;">Entrar no Painel</button>
          </form>

          < />!-- Botão para alternar entre Login e Criar Conta de Primeiro Acesso -->
          <button type="button" id="toggleModeBtn" style="background: transparent; border: none; color: var(--primary-color); font-size: 11px; margin-top: 15px; cursor: pointer; text-decoration: underline;">
            Primeiro acesso? Criar conta de administrador
          </button>

          <div style="margin: 15px 0; color: var(--text-muted); font-size: 11px; text-transform: uppercase;">OU</div>

          < />!-- Botão de Google -->
          <button type="button" id="googleLoginBtn" class="google-btn">
            <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" /><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" /><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" /><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" /></svg>
            Entrar / Registar com Google
          </button>

          <div id="loginErro" style="color: var(--danger); font-size: 11px; margin-top: 10px;"></div>
        </div>
      </></div>
// ==========================================
// MÓDULO DE COLABORADORES
// ==========================================
app.post('/api/colaboradores/cadastrar', async (req, res) => { }
    try { }
    const {nome, email, senha, funcao} = req.body;

    if (!nome || !email || !senha || !funcao) { }
    return res.status(400).json({sucesso}: false, mensagem: "Todos os campos são obrigatórios." });
        }

    const query = `
    INSERT INTO public.colaboradores (nome, email, senha, funcao)
    VALUES ($1, $2, $3, $4)
    RETURNING id, nome, email, funcao
    `;
    const values = [nome, email, senha, funcao];
    const resultado = await pool.query(query, values);

    res.json({sucesso}: true,
    mensagem: "Colaborador cadastrado com sucesso!",
    colaborador: resultado.rows[0]
        });

    } catch (err) {console.error("Erro ao cadastrar colaborador:", err)};
    res.status(500).json({sucesso}: false, mensagem: "Erro ao registar colaborador (e-mail já pode existir)." });
    }
});

// ==========================================
// 5. MÓDULO DO CHAT DO PERSONAGEM (KROM - OPENAI GPT-4O)
// ==========================================
app.post('/api/ia/chat-krom', async (req, res) => { }
    try { }
    const {mensagemDoCliente, historicoConversa} = req.body;

    if (!mensagemDoCliente) { }
    return res.status(400).json({sucesso}: false, mensagem: "Mensagem obrigatória." });
        }

    const systemPromptKrom = `
    Você é o Krom, um mestre duende artesão da Adorê, especialista em fabricação aditiva e modelagem 3D. A sua estética é a de um duende moderno, elegante, amigável e sofisticado — inspirado na magia natalina de excelência e capricho, mas adaptado para o design e tecnologia contemporânea.

    OBJETIVO DA SUA INTERAÇÃO:
    Guiar o cliente de forma encantadora, acolhedora e fluida através de um chat interativo, ajudando-o a transformar ideias, conceitos ou referências em peças reais para impressão 3D.

    DIRETRIZES DE PERSONALIDADE E TOM:
    1. Tom de Voz: Caloroso, polido, entusiasmado, prestativo e ligeiramente mágico (usando expressões elegantes de artesão, como "forjar ideias", "materializar sonhos", "arquitetura perfeita"). Nunca seja robótico.
    2. Empatia e Validação: Valide sempre a criatividade do cliente. Faça-o sentir que está a criar algo verdadeiramente exclusivo.
    3. Clareza Técnica: Traduza conceitos complexos de impressão 3D (como malhas, suporte, filamentos, resoluções) em explicações simples, poéticas e acessíveis.

    FLUXO DA CONVERSA NO CHAT:
    - Passo 1 (Acolhimento): Cumprimente o cliente com carisma, apresentando-se brevemente como o artesão chefe da Adorê.
    - Passo 2 (Descoberta da Ideia): Pergunte o que ele deseja criar (um objeto de decoração, um utilitário, uma miniatura, um presente).
    - Passo 3 (Refinamento): Peça detalhes sobre o estilo, tamanho ou cores desejadas.
    - Passo 4 (Geração do Pedido): Quando a ideia estiver clara, informe ao cliente que vai disparar a "forja mágica" (o motor de IA de modelagem) para preparar a pré-visualização e o link de aprovação da arte.
    `;

    const openai = new OpenAI({apiKey}: process.env.OPENAI_API_KEY });

    const mensagensFormatadas = [
    {role}: "system", content: systemPromptKrom },
    ...(historicoConversa || []),
    {role}: "user", content: mensagemDoCliente }
    ];

    const completion = await openai.chat.completions.create({model}: "gpt-4o",
    messages: mensagensFormatadas,
    temperature: 0.7,
        });

    const respostaKrom = completion.choices[0].message.content;

    res.json({sucesso}: true,
    remetente: "Krom",
    resposta: respostaKrom
        });

    } catch (erro) {console.error("Erro no chat do Krom com OpenAI:", erro)};
    res.status(500).json({sucesso}: false, mensagem: "O Krom foi dar corda aos relógios da oficina, tente novamente em instantes." });
    }
});

// ==========================================
// 6. MÓDULO DE IA PARA MODELAGEM 3D (MESHY & TRIPO3D)
// ==========================================
app.post('/api/ia/gerar', async (req, res) => { }
    try { }
    const {prompt, provedor, categoria} = req.body;

    if (!prompt) { }
    return res.status(400).json({sucesso}: false,
    mensagem: "Por favor, fornece um prompt para a IA." 
            });
        }

    const motorIA = provedor ? provedor.toLowerCase() : 'meshy';
    let resultadoIA = ;

    if (motorIA === 'meshy') {resultadoIA = {
      provedor: "Meshy AI",
      status: "Tarefa criada com sucesso",
      formato_suportado: ".glb / .obj / .stl",
      nota: "Para ativar em produção, insere a MESHY_API_KEY nas variáveis de ambiente do Render."
    }};
        } else if (motorIA === 'tripo') {resultadoIA = {
      provedor: "Tripo3D AI",
      status: "Tarefa criada com sucesso",
      formato_suportado: ".obj / .stl",
      nota: "Para ativar em produção, insere a TRIPO_API_KEY nas variáveis de ambiente do Render."
    }};
        } else { }
    return res.status(400).json({sucesso}: false,
    mensagem: "Provedor de IA inválido. Escolha 'meshy' ou 'tripo'." 
            });
        }

    res.json({sucesso}: true,
    mensagem: `Solicitação de IA enviada com sucesso usando ${resultadoIA.provedor}!`,
    detalhes: {nome_sugerido}: prompt.replace(/\s+/g, '_'),
    categoria: categoria || 'Geral',
    ...resultadoIA
            }
        });

    } catch (erro) {console.error("Erro na geração de IA multimodelo:", erro)};
    res.status(500).json({sucesso}: false,
    mensagem: "Erro interno ao processar o motor de IA escolhido." 
        });
    }
});
// ==========================================
// MÓDULO DE LOGIN E COLABORADORES
// ==========================================

// Rota de Login para Administradores e Colaboradores
app.post('/api/colaboradores/login', async (req, res) => { }
    try { }
    const {email, senha} = req.body;

    if (!email || !senha) { }
    return res.status(400).json({sucesso}: false, mensagem: "E-mail e senha são obrigatórios." });
        }

    const query = 'SELECT * FROM public.colaboradores WHERE email = $1 AND senha = $2';
    const resultado = await pool.query(query, [email, senha]);

    if (resultado.rows.length === 0) { }
    return res.status(401).json({sucesso}: false, mensagem: "E-mail ou senha incorretos." });
        }

    const colaborador = resultado.rows[0];
    res.json({sucesso}: true,
    mensagem: "Login efetuado com sucesso!",
    colaborador: {id}: colaborador.id,
    nome: colaborador.nome,
    email: colaborador.email,
    funcao: colaborador.funcao
            }
        });

    } catch (err) {console.error("Erro no login:", err)};
    res.status(500).json({sucesso}: false, mensagem: "Erro interno no servidor." });
    }
});

// Rota para Cadastrar Novo Colaborador
app.post('/api/colaboradores/cadastrar', async (req, res) => { }
    try { }
    const {nome, email, senha, funcao} = req.body;

    if (!nome || !email || !senha || !funcao) { }
    return res.status(400).json({sucesso}: false, mensagem: "Todos os campos são obrigatórios." });
        }

    const query = `
    INSERT INTO public.colaboradores (nome, email, senha, funcao)
    VALUES ($1, $2, $3, $4)
    RETURNING id, nome, email, funcao
    `;
    const resultado = await pool.query(query, [nome, email, senha, funcao]);

    res.json({sucesso}: true,
    mensagem: "Colaborador cadastrado com sucesso!",
    colaborador: resultado.rows[0]
        });

    } catch (err) {console.error("Erro ao cadastrar colaborador:", err)};
    res.status(500).json({sucesso}: false, mensagem: "Erro ao registar colaborador (e-mail já pode existir)." });
    }
});
    // ==========================================
    // 7. INICIALIZAÇÃO DO SERVIDOR (APP LISTEN)
    // ==========================================
    const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {console.log(`Servidor rodando na porta ${PORT}`)};
});</>;
