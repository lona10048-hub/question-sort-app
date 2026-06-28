# 질문 카드 분류하기

초등학교 "질문하는 힘 기르기" 수업 1차시에서 사용하는 학습 도구입니다.
학생들이 18개의 질문 카드를 보고, 스스로 분류 기준을 정해 자유롭게 묶어보는 활동을 위해 만들었습니다.

## 🚀 GitHub Pages로 배포하기 (한 번만 설정하면 됩니다)

### 1단계. 이 폴더를 본인의 GitHub 저장소에 올리기

1. GitHub에서 새 저장소(Repository)를 만듭니다.
   - 저장소 이름을 **`question-sort-app`** 으로 만들면 추가 설정 없이 그대로 사용할 수 있습니다.
   - 다른 이름을 쓰고 싶다면, `vite.config.js` 파일 안의 `base: '/question-sort-app/'` 부분을
     `base: '/저장소이름/'` 으로 바꿔주세요.
2. 이 폴더 전체(`question-sort-app`)의 내용을 새 저장소에 업로드합니다.
   - GitHub 웹사이트에서 "Add file → Upload files"로 폴더 내용을 드래그해서 올리거나,
   - 아래처럼 명령어로 올릴 수도 있습니다.

```bash
cd question-sort-app
git init
git add .
git commit -m "질문 카드 분류하기 도구 추가"
git branch -M main
git remote add origin https://github.com/사용자이름/question-sort-app.git
git push -u origin main
```

### 2단계. GitHub Pages 켜기

1. 저장소 페이지에서 **Settings(설정) → Pages** 로 들어갑니다.
2. "Build and deployment" 항목에서 **Source(원본)** 를 **GitHub Actions** 로 선택합니다.
3. 이미 포함된 `.github/workflows/deploy.yml` 파일이 자동으로 실행되며,
   몇 분 안에 사이트가 만들어집니다.
4. 같은 Pages 설정 화면에 나오는 주소
   (예: `https://사용자이름.github.io/question-sort-app/`) 로 누구나 접속할 수 있습니다.

이후로는 코드를 수정해서 `main` 브랜치에 다시 push할 때마다 자동으로 사이트가 갱신됩니다.

## 💻 내 컴퓨터에서 미리 보기 (선택)

```bash
npm install
npm run dev
```

브라우저에서 안내된 주소(보통 `http://localhost:5173`)로 접속하면 바로 확인할 수 있습니다.

## 📁 주요 파일

- `src/App.jsx` — 질문 카드 분류 도구의 전체 기능이 들어있는 파일
- `vite.config.js` — GitHub Pages 배포 경로(`base`) 설정
- `.github/workflows/deploy.yml` — push할 때마다 자동으로 빌드하고 배포하는 설정

## ✏️ 질문 내용 바꾸기

`src/App.jsx` 파일 맨 위, `INITIAL_QUESTIONS` 배열 안의 문장들을 수정하면
기본으로 들어있는 18개 질문을 바꿀 수 있습니다.
