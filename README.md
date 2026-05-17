# 🚀 ROCKET STARS — Space Chase Game

Космическая аркада с авторизацией Firebase, таблицей лидеров в реальном времени и генеративной музыкой.

## 🎮 Возможности

- 🔥 **Firebase Auth** — регистрация и вход по email
- 🏆 **Realtime Leaderboard** — топ-10 обновляется live
- 🎵 **Web Audio API** — космический ambient + SFX
- 🛡️ **Усилители** — щит и стрельба
- 💚 **3 жизни** — постепенное усложнение

## 🚀 Быстрый старт

1. Создай проект в [Firebase Console](https://console.firebase.google.com/)
2. Включи **Authentication** → Email/Password
3. Создай **Firestore Database**
4. Установи **Security Rules**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

5. Замени `firebaseConfig` в `game.js` на свой
6. Залей на **GitHub Pages** или любой хостинг

## 📁 Структура

```
├── index.html      # Главная страница
├── style.css       # Стили
├── game.js         # Логика + Firebase
└── README.md       # Этот файл
```

## 🎮 Управление

| Клавиша | Действие |
|---------|----------|
| ← → или A D | Движение |
| SPACE или ↑ | Стрельба (с усилителем ⚡) |

## 🔗 Деплой на GitHub Pages

1. Форкни или создай репозиторий
2. Загрузи 3 файла (`index.html`, `style.css`, `game.js`)
3. Settings → Pages → Source: Deploy from a branch → Main → / (root)
4. Сайт будет доступен по `https://username.github.io/repo-name/`

## 📄 Лицензия

MIT — делай что хочешь! 🚀
