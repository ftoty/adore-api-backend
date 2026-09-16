<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Oficina Adorê - Estúdio 3D Criativo</title>
    
    <!-- CDNs Essenciais -->
    <!-- 1. Three.js para renderização e motores 3D -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

    <!-- 2. Supabase SDK para Autenticação, Banco de Dados e Edge Functions -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

    <!-- 3. Mercado Pago Bricks SDK para checkout seguro -->
    <script src="https://sdk.mercadopago.com/js/v2"></script>

    <style>
        :root {
            --bg-base: #0f0f11;
            --bg-surface: #17171a;
            --bg-card: #202024;
            --accent-green: #C5F955;
            --accent-pink: #FF97C2;
            --text-main: #fafafa;
            --text-muted: #94949e;
            --border-color: rgba(255, 255, 255, 0.08);
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            background-color: var(--bg-base); 
            color: var(--text-main); 
            font-family: 'Barlow', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            overflow: hidden; 
            height: 100vh; 
            width: 100vw; 
            display: flex; 
            flex-direction: column; 
        }

        /* Scrollbars customizadas */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: var(--bg-base); }
        ::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--accent-green); }

        /* CABEÇALHO / BANNER SUPERIOR */
        .top-banner {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 56px;
            width: 100%;
            background: var(--bg-surface);
            border-bottom: 1px solid var(--border-color);
            padding: 0 16px;
            flex-shrink: 0;
            z-index: 100;
        }

        .logo-area { display: flex; align-items: center; gap: 10px; }
        .logo-text { font-size: 16px; font-weight: 800; color: var(--accent-green); letter-spacing: 0.5px; cursor: pointer; text-transform: uppercase; }

        .nav-menu { display: flex; align-items: center; gap: 4px; }
        .dropdown-container { position: relative; }
        .nav-btn {
            background: transparent;
            border: none;
            color: var(--text-muted);
            font-size: 13px;
            font-weight: 500;
            padding: 6px 10px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 5px;
            border-radius: 6px;
        }
        .nav-btn:hover { color: var(--text-main); background: rgba(255,255,255,0.05); }

        .dropdown-menu {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.6);
            width: 200px;
            padding: 6px;
            z-index: 101;
        }
        .dropdown-container.open .dropdown-menu { display: block; }
        .dropdown-item {
            display: block;
            padding: 8px 10px;
            color: var(--text-muted);
            font-size: 12px;
            text-decoration: none;
            border-radius: 4px;
            cursor: pointer;
        }
        .dropdown-item:hover { background: rgba(255,255,255,0.06); color: var(--text-main); }

        .top-right-controls { display: flex; align-items: center; gap: 10px; }
        .credits-badge {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            color: #FFD700;
            cursor: pointer;
        }
        .agent-status-pill {
            background: rgba(197, 249, 85, 0.12);
            color: var(--accent-green);
            border: 1px solid rgba(197, 249, 85, 0.3);
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        .upgrade-btn-top {
            background: linear-gradient(135deg, var(--accent-green), var(--accent-pink));
            color: #000;
            border: none;
            padding: 5px 12px;
            font-weight: 700;
            font-size: 11px;
            border-radius: 6px;
            cursor: pointer;
        }
        .icon-btn { background: transparent; border: none; color: var(--text-muted); cursor: pointer; font-size: 15px; padding: 6px; }
        .icon-btn:hover { color: var(--text-main); }

        /* GRID PRINCIPAL DE 3 COLUNAS */
        .workspace-layout {
            display: grid;
            grid-template-columns: 240px 1fr 300px;
            width: 100%;
            height: calc(100vh - 56px);
            overflow: hidden;
        }

        /* SIDEBAR ESQUERDA */
        .left-sidebar {
            background: var(--bg-surface);
            border-right: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
            padding: 14px;
            gap: 14px;
            overflow-y: auto;
        }
        .tool-tabs-vertical { display: flex; flex-direction: column; gap: 4px; }
        .tool-tab-btn {
            background: transparent;
            border: none;
            color: var(--text-muted);
            padding: 10px 12px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            text-align: left;
            width: 100%;
        }
        .tool-tab-btn:hover, .tool-tab-btn.active {
            background: var(--bg-card);
            color: var(--accent-green);
            border: 1px solid var(--border-color);
        }
        .tool-settings-box {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            font-size: 12px;
        }

        /* CANVAS CENTRAL & VISUALIZADOR 3D */
        .center-canvas {
            background: var(--bg-base);
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
        }
        .viewport-3d {
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at center, #1b1b22 0%, #0f0f11 75%);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
        }
        #webgl-container {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            outline: none;
        }
        .viewport-overlay-ui {
            position: absolute;
            bottom: 20px;
            z-index: 10;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            pointer-events: none;
        }
        .viewport-overlay-ui > * { pointer-events: auto; }
        .generate-main-btn {
            background: linear-gradient(135deg, var(--accent-green), var(--accent-pink));
            color: #000;
            border: none;
            padding: 12px 28px;
            font-weight: 700;
            font-size: 14px;
            border-radius: 8px;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(197, 249, 85, 0.3);
            transition: transform 0.2s;
        }
        .generate-main-btn:hover { transform: scale(1.03); }

        /* SIDEBAR DIREITA */
        .right-sidebar {
            background: var(--bg-surface);
            border-left: 1px solid var(--border-color);
            padding: 14px;
            display: flex;
            flex-direction: column;
            gap: 14px;
            overflow-y: auto;
        }
        .search-input-wrapper { position: relative; width: 100%; }
        .search-input-wrapper input {
            width: 100%;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            color: var(--text-main);
            padding: 8px 10px 8px 30px;
            border-radius: 6px;
            font-size: 12px;
            outline: none;
        }
        .search-input-wrapper svg {
            position: absolute; left: 10px; top: 10px; width: 12px; height: 12px; color: var(--text-muted);
        }
        .upload-action-btn {
            background: var(--accent-green);
            color: #000;
            border: none;
            padding: 8px;
            border-radius: 6px;
            font-weight: 700;
            font-size: 12px;
            cursor: pointer;
            text-align: center;
            width: 100%;
        }
        .assets-grid-right {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
        }
        .asset-mini-card {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            height: 90px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 6px;
            cursor: pointer;
            transition: border-color 0.2s;
        }
        .asset-mini-card:hover { border-color: var(--accent-green); }
        .asset-mini-card img { width: 100%; height: 55px; object-fit: cover; border-radius: 4px; background: #222; }
        .asset-mini-card span { font-size: 10px; color: var(--text-muted); margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; text-align: center; }

        /* MODAIS GLOBAIS */
        .krom-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0, 0, 0, 0.75); z-index: 999999;
            display: flex; align-items: center; justify-content: center;
        }
        .krom-modal-card {
            background: var(--bg-card); border: 1px solid var(--border-color);
            border-radius: 12px; width: 380px; padding: 24px;
            display: flex; flex-direction: column; gap: 16px; color: var(--text-main);
            box-shadow: 0 15px 35px rgba(0,0,0,0.9);
        }
        .hidden { display: none !important; }
    </style>
</head>
<body>

    <!-- CABEÇALHO SUPERIOR -->
    <header class="top-banner">
        <div class="logo-area">
            <span class="logo-text" onclick="alert('Oficina Adorê v1.0 - Estúdio 3D Ativo')">Oficina Adorê</span>
        </div>

        <nav class="nav-menu">
            <button class="nav-btn" onclick="abrirComunidade()">Comunidade</button>
            <button class="nav-btn" onclick="abrirAPI()">API</button>
            
            <div class="dropdown-container" onclick="toggleDropdown(this, event)">
                <button class="nav-btn">Recursos ▾</button>
                <div class="dropdown-menu">
                    <a class="dropdown-item" onclick="filtrarSecao('aprender')">Desbravar (Aprender)</a>
                    <a class="dropdown-item" onclick="filtrarSecao('programas')">Programas</a>
                    <a class="dropdown-item" onclick="filtrarSecao('plugins')">Plugins</a>
                    <a class="dropdown-item" onclick="filtrarSecao('ferramentas')">Ferramentas</a>
                </div>
            </div>

            <div class="dropdown-container" onclick="toggleDropdown(this, event)">
                <button class="nav-btn">Laboratório Criativo ▾</button>
                <div class="dropdown-menu">
                    <a class="dropdown-item" onclick="filtrarLab('figurinhas')">Figurinhas</a>
                    <a class="dropdown-item" onclick="filtrarLab('chaveiros')">Chaveiros</a>
                    <a class="dropdown-item" onclick="filtrarLab('utilidades')">Utilidades</a>
                    <a class="dropdown-item" onclick="filtrarLab('sublimacao')">Sublimação</a>
                </div>
            </div>
        </nav>

        <div class="top-right-controls">
            <button class="nav-btn" onclick="abrirModalAuth('login')" style="color: var(--accent-green); font-weight: 700;">Entrar</button>
            <div class="agent-status-pill">🟢 Agente</div>
            <div class="credits-badge" onclick="abrirModalUpgrade()" title="Créditos disponíveis">🟡 110</div>
            <button class="upgrade-btn-top" onclick="abrirModalUpgrade()">Atualizar</button>
            <button class="icon-btn" title="Histórico de Projetos" onclick="abrirHistoricoProjetos()">📂</button>
            <button class="icon-btn" title="Notificações" onclick="abrirNotificacoes()">🔔</button>
            <button class="icon-btn" title="Configurações & Admin" onclick="abrirPainelAdministrativo()">⚙️</button>
        </div>
    </header>

    <!-- LAYOUT PRINCIPAL -->
    <div class="workspace-layout">
        
        <!-- Sidebar Esquerda (Ferramentas) -->
        <aside class="left-sidebar">
            <div class="tool-tabs-vertical">
                <button class="tool-tab-btn active" onclick="selecionarFerramenta('imagem', event)">🎨 Imagem</button>
                <button class="tool-tab-btn" onclick="selecionarFerramenta('modelo', event)">🧊 Modelo 3D</button>
                <button class="tool-tab-btn" onclick="selecionarFerramenta('imprimir', event)">🖨️ Imprimir</button>
                <button class="tool-tab-btn" onclick="selecionarFerramenta('animar', event)">🎬 Animar</button>
            </div>
            <div class="tool-settings-box">
                <span style="font-weight: 700; color: var(--text-main);">Configuração Ativa</span>
                <span style="color: var(--text-muted);">Alto Detalhe • Adorê Engine</span>
                <button onclick="alternarGeometria3D()" style="background: var(--bg-base); color: var(--accent-green); border: 1px solid var(--border-color); padding: 6px; border-radius: 4px; font-size: 11px; font-weight: bold; cursor: pointer; margin-top: 4px;">Trocar Malha 3D</button>
            </div>
        </aside>

        <!-- Canvas Central (Viewport 3D Three.js) -->
        <main class="center-canvas">
            <div class="viewport-3d">
                <div id="webgl-container"></div>

                <div class="viewport-overlay-ui">
                    <div style="background: rgba(15,15,17,0.8); padding: 8px 16px; border-radius: 20px; border: 1px solid var(--border-color); font-size: 11px; color: var(--text-muted); backdrop-filter: blur(5px);">
                        🖱️ Clique e arraste para rotacionar • Scroll para zoom
                    </div>
                    <button class="generate-main-btn" onclick="executarConversao3D()">✨ Gerar modelo</button>
                </div>
            </div>
        </main>

        <!-- Sidebar Direita (Ativos e Upload) -->
        <aside class="right-sidebar">
            <div class="search-input-wrapper">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                <input type="text" placeholder="Procura minha geração..." id="inputBuscaAtivos">
            </div>
            <button class="upload-action-btn" onclick="abrirCarregar()">Carregar</button>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
                <p style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Ativos Recentes</p>
                <span onclick="abrirHistoricoProjetos()" style="font-size: 10px; color: var(--accent-green); cursor: pointer; text-decoration: underline;">Ver Todos</span>
            </div>
            <div class="assets-grid-right">
                <div class="asset-mini-card" onclick="carregarMalhaPreset('esfera')"><img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=80"><span>Esfera PBR</span></div>
                <div class="asset-mini-card" onclick="carregarMalhaPreset('torus')"><img src="https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=200&q=80"><span>Torus Adorê</span></div>
            </div>
        </aside>
    </div>

    <!-- WIDGET FLUTUANTE DE ASSISTENTE -->
    <div id="kromFloatingWidget" style="position: fixed; bottom: 25px; right: 25px; z-index: 99999; display: flex; flex-direction: column; align-items: flex-end;">
        <div id="kromChatWindow" class="hidden" style="width: 360px; height: 480px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 14px; display: flex; flex-direction: column; overflow: hidden; margin-bottom: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
            <div style="background: var(--bg-surface); padding: 12px 15px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-color);">
                <span style="font-size: 13px; font-weight: bold; color: var(--text-main);">Assistente • Oficina Adorê</span>
                <button id="fecharChatKrom" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; font-size: 16px;">✕</button>
            </div>
            <div id="kromChatMessages" style="flex: 1; padding: 12px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; font-size: 12px;">
                <div style="background: var(--bg-surface); padding: 8px 12px; border-radius: 8px; border-left: 3px solid var(--accent-green); color: var(--text-main);">Olá! Assistente da Oficina Adorê na escuta. Como posso ajudar?</div>
            </div>
            <div style="padding: 10px; background: var(--bg-surface); border-top: 1px solid var(--border-color); display: flex; gap: 6px;">
                <input type="text" id="kromInputText" placeholder="Digite sua dúvida..." style="flex: 1; background: var(--bg-base); color: white; border: 1px solid var(--border-color); border-radius: 6px; padding: 8px; font-size: 12px; outline: none;">
                <button id="kromSendBtn" style="background: var(--accent-green); color: #000; border: none; padding: 0 12px; border-radius: 6px; font-weight: bold; cursor: pointer;">Enviar</button>
            </div>
        </div>
        <div id="kromAvatarToggle" title="Abrir assistente" style="width: 80px; height: 80px; border-radius: 50%; overflow: hidden; border: 3px solid var(--accent-green); box-shadow: 0 5px 25px rgba(0,0,0,0.9); cursor: pointer; background: #111; display: flex; align-items: center; justify-content: center;">
            <video src="assets/krom-animacao.mp4" autoplay loop muted playsinline style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'"></video>
        </div>
    </div>

    <!-- INJEÇÃO DINÂMICA DE MODAIS -->
    <div id="kromModalContainer"></div>

    <!-- CARREGAMENTO DO SEU CÓDIGO JAVASCRIPT EXTERNO -->
    <script src="oficina.js"></script>
</body>
</html>