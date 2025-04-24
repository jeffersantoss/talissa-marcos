document.addEventListener('DOMContentLoaded', () => {
    const routeButtons = document.querySelectorAll('.route-button');

    routeButtons.forEach(button => {
        button.addEventListener('click', handleRouteButtonClick);
    });

    // Função principal refatorada para async/await para lidar com SweetAlert
    async function handleRouteButtonClick(event) {
        const button = event.target;
        const destination = button.dataset.destination;

        if (!destination) {
            Swal.fire('Erro', 'Endereço de destino não encontrado.', 'error');
            return;
        }

        // Pergunta ao usuário usando SweetAlert2
        const confirmResult = await Swal.fire({
            title: 'Como traçar a rota?',
            text: 'Usar sua localização atual ou digitar o endereço de partida?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Usar Localização Atual',
            cancelButtonText: 'Digitar Endereço',
            confirmButtonColor: '#8f9a7b', // Verde
            cancelButtonColor: '#776a62' // Cinza/Marrom
        });

        if (confirmResult.isConfirmed) {
            // --- Lógica de Geolocalização ---
            if ('geolocation' in navigator) {
                button.textContent = 'Obtendo localização...';
                button.disabled = true;
                try {
                    const position = await new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, {
                            enableHighAccuracy: true,
                            timeout: 10000,
                            maximumAge: 0
                        });
                    });
                    handleGeoSuccess(position, destination, button);
                } catch (error) {
                    handleGeoError(error, button);
                }
            } else {
                Swal.fire('Erro', 'Geolocalização não é suportada pelo seu navegador.', 'error');
            }
        } else if (confirmResult.dismiss === Swal.DismissReason.cancel) {
            // --- Lógica para Endereço Manual com SweetAlert2 ---
            const { value: startAddress } = await Swal.fire({
                title: 'Endereço de Partida',
                input: 'text',
                inputLabel: 'Digite o endereço de onde você sairá',
                inputPlaceholder: 'Ex: Av. Paulista, 1000, São Paulo',
                showCancelButton: true,
                confirmButtonText: 'Traçar Rota',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#8f9a7b',
                inputValidator: (value) => {
                    if (!value || value.trim() === '') {
                        return 'Por favor, digite um endereço!'
                    }
                }
            });

            if (startAddress) {
                handleManualAddress(startAddress, destination);
            }
        }
        // Se o usuário fechar o modal (dismiss !== cancel), não faz nada
    }

    function handleGeoSuccess(position, destination, button) {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;
        const encodedDestination = encodeURIComponent(destination);
        const mapsUrl = `https://www.google.com/maps/dir/${userLat},${userLon}/${encodedDestination}`;
        window.open(mapsUrl, '_blank');
        // Restaura o botão
        button.textContent = 'Traçar Rota a partir da sua localização';
        button.disabled = false;
    }

    function handleGeoError(error, button) {
        console.error('Erro de Geolocalização:', error);
        let message = 'Não foi possível obter sua localização. Verifique as permissões.';
        let iconType = 'warning'; // Ícone padrão
        switch(error.code) {
            case error.PERMISSION_DENIED:
                message = 'Você negou a permissão de localização.';
                iconType = 'error';
                break;
            case error.POSITION_UNAVAILABLE:
                message = 'Informação de localização indisponível.';
                break;
            case error.TIMEOUT:
                message = 'Tempo limite para obter localização esgotado.';
                break;
        }
        Swal.fire('Erro de Localização', message, iconType);
        // Restaura o botão
        button.textContent = 'Traçar Rota a partir da sua localização';
        button.disabled = false;
    }

    // Função para endereço manual (inalterada, apenas chamada de forma diferente)
    function handleManualAddress(startAddress, destination) {
        const encodedStart = encodeURIComponent(startAddress);
        const encodedDestination = encodeURIComponent(destination);
        const mapsUrl = `https://www.google.com/maps/dir/${encodedStart}/${encodedDestination}`;
        window.open(mapsUrl, '_blank');
    }

    // --- LÓGICA DO COUNTDOWN ---
    const countdownElement = document.getElementById('countdown-timer');
    // IMPORTANTE: Meses em JavaScript são 0-indexados (Janeiro=0, ..., Julho=6, Agosto=7)
    const weddingDate = new Date('2025-08-03T16:00:00'); // 3 de Agosto de 2025, 16:00

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = weddingDate - now;

        // Cálculos de tempo
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Formata a saída HTML
        if (distance < 0) {
            countdownElement.innerHTML = "<div class='countdown-ended'>O grande dia chegou!</div>";
            clearInterval(countdownInterval); // Para o contador
            return;
        }

        countdownElement.innerHTML = `
            <div class="countdown-item"><span>${days}</span> Dias</div>
            <div class="countdown-item"><span>${hours}</span> Horas</div>
            <div class="countdown-item"><span>${minutes}</span> Minutos</div>
            <div class="countdown-item"><span>${seconds}</span> Segundos</div>
        `;
    }

    // Atualiza imediatamente e depois a cada segundo
    updateCountdown();
    const countdownInterval = setInterval(updateCountdown, 1000);
}); 