import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base: GitHub Pages 저장소 이름과 동일하게 맞춰주세요.
// 예) 저장소 주소가 https://github.com/내아이디/question-sort-app 이라면
//     아래 값을 '/question-sort-app/' 으로 그대로 두면 됩니다.
//     저장소 이름을 바꾸면 이 값도 '/바뀐이름/' 으로 함께 바꿔주세요.
export default defineConfig({
  base: '/question-sort-app/',
  plugins: [react()],
})
