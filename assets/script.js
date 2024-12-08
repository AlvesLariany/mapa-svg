
const selecaoEstado = document.getElementById("selecaoEstado");
const selecaoMunicipio = document.getElementById("selecaoMunicipio");
const map = L.map('mapa').setView([-15.7212, -54.3030], 4);//usando o centro geográfuico do Brasil, latitudee longitude

document.addEventListener("DOMContentLoaded", function() {
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    let marker;

    function carregarEstados() {
        fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados")//obetr os dados via api, listando os estados
            .then(response => response.json())
            .then(estados => {
                estados.forEach(estado => {
                    const option = document.createElement("option");
                    option.value = estado.sigla;
                    option.textContent = estado.nome;
                    selecaoEstado.appendChild(option);
                });
            })
            .catch(error => console.error("Erro", error));
    }

    function carregarMunicipios(estadoSigla) {
        fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoSigla}/municipios`)
            .then(response => response.json())
            .then(municipios => {
               selecaoMunicipio.textContent = '<option value="">Selecione um município</option>';
                municipios.forEach(municipio => {
                    const option = document.createElement("option");
                    option.value = municipio.nome;
                    option.textContent = municipio.nome;
                   selecaoMunicipio.appendChild(option);
                });
               selecaoMunicipio.disabled = false;
            })
            .catch(error => console.error("Erro", error));
    }

    function buscarCoordenadas(municipioNome) {
        fetch(`https://nominatim.openstreetmap.org/search?q=${municipioNome}, Brasil&format=json`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    const { lat, lon } = data[0];
                    const centro = [parseFloat(lat), parseFloat(lon)];

                    if (marker) {
                        map.removeLayer(marker);
                    }

                    marker = L.marker(centro).addTo(map);
                    map.setView(centro, 12);
                } else {
                    alert("Coorrdenadas não encontradas");
                }
            })
            .catch(error => console.error("Erro", error));
    }

    selecaoEstado.addEventListener("change", function() {
        const estadoSigla = selecaoEstado.value;
        if (estadoSigla) {
            carregarMunicipios(estadoSigla);
        } else {
           selecaoMunicipio.textContent = '<option value="">Selecione o município</option>';
           selecaoMunicipio.disabled = true;
        }
    });

   selecaoMunicipio.addEventListener("change", function() {
        const municipioNome =selecaoMunicipio.value;
        if (municipioNome) {
            buscarCoordenadas(municipioNome);
        }
    });

    carregarEstados();
});
