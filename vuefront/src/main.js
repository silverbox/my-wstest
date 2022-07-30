import { createApp } from 'vue'
import App from './App.vue'
import Chat from 'vue3-beautiful-chat'

const app = createApp(App)
app.use(Chat)
app.mount('#app')
