import geopandas as gpd
import os


# ======================================================
# ARQUIVOS
# ======================================================

entrada = r"public\geo\brasil-ufs.geojson"

saida = r"public\geo\brasil-ufs-web.geojson"


# ======================================================
# VERIFICAR ARQUIVO
# ======================================================

if not os.path.exists(entrada):
    raise FileNotFoundError(
        f"Arquivo não encontrado: {entrada}"
    )


# ======================================================
# CARREGAR GEOJSON
# ======================================================

print("Carregando GeoJSON...")

gdf = gpd.read_file(entrada)


print(
    "Quantidade de UFs:",
    len(gdf)
)


print(
    "SRC:",
    gdf.crs
)


# ======================================================
# TAMANHO ORIGINAL
# ======================================================

tamanho_original = (
    os.path.getsize(entrada)
    / 1024
    / 1024
)


print(
    "\nTamanho original:",
    round(
        tamanho_original,
        2
    ),
    "MB"
)


# ======================================================
# PROJEÇÃO MÉTRICA
# ======================================================

print(
    "\nConvertendo temporariamente para projeção métrica..."
)

gdf_metrico = gdf.to_crs(
    "EPSG:5880"
)


# ======================================================
# SIMPLIFICAR
# ======================================================

print(
    "Simplificando geometrias..."
)

gdf_metrico[
    "geometry"
] = (
    gdf_metrico
    .geometry
    .simplify(
        tolerance=1000,
        preserve_topology=True
    )
)


# ======================================================
# VOLTAR PARA WGS84
# ======================================================

gdf_web = (
    gdf_metrico
    .to_crs(
        "EPSG:4326"
    )
)


# ======================================================
# EXPORTAR
# ======================================================

print(
    "Salvando versão web..."
)

gdf_web.to_file(
    saida,
    driver="GeoJSON"
)


# ======================================================
# TAMANHO FINAL
# ======================================================

tamanho_final = (
    os.path.getsize(saida)
    / 1024
    / 1024
)


print(
    "\n=============================="
)

print(
    "Tamanho original:",
    round(
        tamanho_original,
        2
    ),
    "MB"
)

print(
    "Tamanho simplificado:",
    round(
        tamanho_final,
        2
    ),
    "MB"
)


if tamanho_original > 0:

    reducao = (
        1 -
        (
            tamanho_final
            /
            tamanho_original
        )
    ) * 100


    print(
        "Redução:",
        round(
            reducao,
            1
        ),
        "%"
    )


print(
    "=============================="
)


print(
    "\nArquivo criado:"
)

print(
    saida
)