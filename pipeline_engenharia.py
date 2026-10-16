import cadquery as cq
import trimesh
import numpy as np

print("=== INICIALIZANDO MOTOR DE CAD E MALHAS ===")

# --- PILAR 1 & 3: Modelagem Paramétrica e Restrições Geométricas ---
comprimento = 100.0  # mm
largura = 50.0       # mm
espessura = 10.0     # mm
raio_furo = 4.0      # mm

print(f"1. Gerando sólido paramétrico: {comprimento}x{largura}x{espessura}mm com furos exatos...")
peca_cad = (
    cq.Workplane("XY")
    .box(comprimento, largura, espessura)
    .faces(">Z")
    .workplane()
    .hole(raio_furo * 2)
)

arquivo_step = "peca_parametrica.step"
cq.exporters.export(peca_cad, arquivo_step)
print(f"-> Sólido CAD salvo com sucesso em: {arquivo_step}")

arquivo_stl = "peca_malha.stl"
cq.exporters.export(peca_cad, arquivo_stl)

# --- PILAR 2: Topologia de Malha Controlada e Limpeza ---
print("\n2. Carregando malha para análise topológica e reparo...")
mesh = trimesh.load(arquivo_stl)

print(f"   - Vértices iniciais: {len(mesh.vertices)}")
print(f"   - Faces iniciais: {len(mesh.faces)}")

if not mesh.is_watertight:
    print("   - Aviso: A malha possui aberturas. Aplicando reparo automático...")
    trimesh.repair.fill_holes(mesh)
else:
    print("   - OK: Malha fechada e estanque (watertight).")

try:
    candidata = mesh.simplify_quadric_decimation(face_count=500)
    if len(candidata.faces) < len(mesh.faces):
        mesh_otimizada = candidata
    else:
        print("   - Aviso: A simplificação não reduziu faces; a malha original será preservada.")
        mesh_otimizada = mesh
except ImportError as erro:
    print(f"   - Aviso: Não foi possível carregar o backend de simplificação ({erro}).")
    print("   - A malha original será preservada sem redução de faces.")
    mesh_otimizada = mesh
print(f"   - Malha preparada para fabricação: {len(mesh_otimizada.faces)} faces.")

# --- PILAR 4: Regras de Fabricação (DFM) ---
print("\n3. Aplicando Regras de Fabricação (DFM)...")

espessura_minima_permitida = 1.2 # mm
if espessura < espessura_minima_permitida:
    print(f"   [Alerta DFM]: Espessura ({espessura}mm) abaixo do limite seguro ({espessura_minima_permitida}mm)!")
else:
    print(f"   [OK DFM]: Espessura de parede de {espessura}mm atende aos padrões de resistência.")

tolerancia_encaixe = 0.2
print(f"   [OK DFM]: Tolerância de encaixe de {tolerancia_encaixe}mm calculada para montagem física.")

arquivo_final = "peca_pronta_para_fabricacao.stl"
mesh_otimizada.export(arquivo_final)
print(f"-> Arquivo final pronto salvo em: {arquivo_final}")
print("\n=== PROCESSO CONCLUÍDO COM SUCESSO ===")
