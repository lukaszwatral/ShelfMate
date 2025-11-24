<template>
  <div class="nfc-container">
    <h2>Wynik Skanowania</h2>

    <div v-if="tagId" class="result-box success">
      <p>Zeskanowano Tag!</p>
      <div class="tag-display">{{ tagId }}</div>
      <p class="info-text">Przyłóż inny tag, aby zmienić wynik.</p>
    </div>

    <div v-else class="result-box waiting">
      <p>Oczekiwanie na tag...</p>
      <p class="info-text">Możesz przyłożyć tag teraz.</p>
    </div>

    <button @click="$router.push('/')" class="back-btn">Wróć do strony głównej</button>
  </div>
</template>

<script>
export default {
  name: 'NfcScanner',
  // Odbieramy tagId z routera jako prop
  props: ['tagId'],
};
</script>

<style scoped>
.nfc-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  padding: 20px;
  margin-top: 50px;
}

.result-box {
  padding: 30px;
  border-radius: 12px;
  width: 100%;
  max-width: 300px;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.success {
  background-color: #e8f5e9;
  border: 2px solid #4caf50;
}

.waiting {
  background-color: #f5f5f5;
  border: 2px dashed #999;
}

.tag-display {
  font-size: 28px;
  font-weight: bold;
  font-family: monospace;
  margin: 15px 0;
  color: #2e7d32;
}

.info-text {
  color: #666;
  font-size: 14px;
}

.back-btn {
  padding: 12px 24px;
  background-color: #607d8b;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
}
</style>
