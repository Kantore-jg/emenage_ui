<template>
  <div class="row justify-content-center">
    <div class="col-md-8">
      <div class="card shadow-lg border-0">
        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center" style="background: linear-gradient(135deg, #2c5f2d 0%, #97bc62 100%) !important;">
          <h4 class="mb-0"><i class="fas fa-qrcode"></i> Scanner d'Identité</h4>
          <router-link to="/dashboard/securite" class="btn btn-light btn-sm">Retour</router-link>
        </div>
        <div class="card-body text-center">
          <p class="text-muted mb-4">Placez le QR Code de la carte devant la caméra pour vérifier l'identité.</p>

          <div id="reader" v-show="!scannedData" style="width: 100%; max-width: 500px; margin: 0 auto; border-radius: 10px; overflow: hidden; border: 2px solid #eee;"></div>

          <div v-if="scannedData" class="mt-4 text-start">
            <div class="alert alert-success border-0 shadow-sm">
              <h5 class="alert-heading mb-3"><i class="fas fa-check-circle"></i> Citoyen Identifié</h5>
              <table class="table table-sm table-borderless mb-0">
                <tr><td style="width: 120px;"><strong>Nom :</strong></td><td class="text-uppercase fw-bold">{{ scannedData.nom }}</td></tr>
                <tr><td><strong>Téléphone :</strong></td><td>{{ scannedData.tel }}</td></tr>
                <tr><td><strong>Quartier :</strong></td><td>{{ scannedData.quartier }}</td></tr>
                <tr><td><strong>Adresse :</strong></td><td>{{ scannedData.adresse }}</td></tr>
                <tr><td><strong>Rôle :</strong></td><td>{{ scannedData.role }}</td></tr>
                <tr><td><strong>Généré le :</strong></td><td class="small text-muted">{{ scannedData.date_generation ? new Date(scannedData.date_generation).toLocaleString('fr-FR') : 'N/A' }}</td></tr>
              </table>
            </div>
            <button @click="resetScanner" class="btn btn-outline-primary w-100">
              <i class="fas fa-sync"></i> Scanner un autre code
            </button>
          </div>

          <div v-if="scanError" class="mt-3 alert alert-danger">
            Format de code non reconnu ou illisible.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const scannedData = ref(null)
const scanError = ref(false)
let html5QrCode = null

function loadQrLib() {
  return new Promise((resolve) => {
    if (window.Html5Qrcode) { resolve(); return }
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/html5-qrcode'
    script.onload = resolve
    document.head.appendChild(script)
  })
}

function onScanSuccess(decodedText) {
  try {
    const data = JSON.parse(decodedText)
    scannedData.value = data
    scanError.value = false
    if (html5QrCode) {
      html5QrCode.stop().catch(() => {})
    }
  } catch (e) {
    scanError.value = true
  }
}

function initScanner() {
  html5QrCode = new window.Html5Qrcode('reader')
  html5QrCode.start(
    { facingMode: 'environment' },
    { fps: 10, qrbox: { width: 250, height: 250 } },
    onScanSuccess
  ).catch((err) => {
    console.error('Camera error:', err)
  })
}

function resetScanner() {
  scannedData.value = null
  scanError.value = false
  initScanner()
}

onMounted(async () => {
  await loadQrLib()
  initScanner()
})

onUnmounted(() => {
  if (html5QrCode) {
    html5QrCode.stop().catch(() => {})
  }
})
</script>
