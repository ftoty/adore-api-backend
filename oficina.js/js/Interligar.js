const fs = require('fs');

// 1. Adiciona o link no index.html (Painel Administrativo)
if (fs.existsSync('index.html')) {
    let indexHtml = fs.readFileSync('index.html', 'utf8');
    const linkIndexBar = '<button class="nav-link-btn" onclick="window.location.href=\'estudio-3d.html\'" style="background: rgba(255,123,0,0.15); border-color: var(--primary-color); color: var(--primary-color); font-weight: bold; margin-top: 10px;">🚀 Abrir Estúdio 3D Pro</button>';
    
    if (!indexHtml.includes('estudio-3d.html')) {
        indexHtml = indexHtml.replace('<button class="nav-link-btn active" data-target="viewVitrine">', linkIndexBar + '\n    <button class="nav-link-btn active" data-target="viewVitrine">');
        fs.writeFileSync('index.html', indexHtml);
        console.log('Sucesso: Link adicionado ao index.html!');
    }
}

// 2. Adiciona o link no estudio-3d.html (Estúdio 3D)
if (fs.existsSync('estudio-3d.html')) {
    let estudioHtml = fs.readFileSync('estudio-3d.html', 'utf8');
    const linkEstudioBar = '<button class="menu-item-max" onclick="window.location.href=\'index.html\'" style="color: #ff7b00; font-weight: bold;">⚙️ Voltar ao Painel Admin</button>';
    
    if (!estudioHtml.includes('index.html')) {
        estudioHtml = estudioHtml.replace('<div class="max-menubar">', '<div class="max-menubar">\n        ' + linkEstudioBar);
        fs.writeFileSync('estudio-3d.html', estudioHtml);
        console.log('Sucesso: Link adicionado ao estudio-3d.html!');
    }
}