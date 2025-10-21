# 🚀 StudyMate - 함께 성장하는 스터디 플랫폼

**StudyMate**는 함께 배우고 성장하고 싶은 사람들을 위한 온라인 스터디 그룹 플랫폼입니다. 
<br>스터디를 만들고, 참여하고, 멤버들과 실시간으로 소통하며 목표를 향해 나아가세요.

<br>

<p align="center">
  <a href="https://studymate.tetraplace.com" target="_blank">
    <img src="https://img.shields.io/badge/Live_Demo-4A90E2?style=for-the-badge&logo=rocket&logoColor=white" alt="Live"/>
  </a>
</p>

<br>

## 👥 구성원

<table align="center">
  <tr>
    <td align="center" width="200">
      <a href="https://github.com/HaeBun">
        <img src="https://github.com/HaeBun.png?size=100" width="100px;" alt="HaeBun"/>
        <br />
        <sub><b>김인태 (HaeBun)</b></sub>
      </a>
      <br />
      <sub>프론트엔드 (React)</sub>
    </td>
    <td align="center" width="200">
      <a href="https://github.com/jkj5747">
        <img src="https://github.com/jkj5747.png?size=100" width="100px;" alt="jkj5747"/>
        <br />
        <sub><b>장경준 (jkj5747)</b></sub>
      </a>
      <br />
      <sub>백엔드 (Node.js)</sub>
    </td>
  </tr>
</table>

<br>

## 📚 프로젝트 문서

각 파트별 상세 문서는 아래 링크를 통해 확인하실 수 있습니다.

<p align="center">
  <a href="../studymate/client/README.md">
    <img src="https://img.shields.io/badge/Client-React-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="Client README"/>
  </a>
  &nbsp;
  <a href="../studymate/server/README.md">
    <img src="https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Backend README"/>
  </a>
  &nbsp;
  <a href="../studymate/databases/README.md">
    <img src="https://img.shields.io/badge/Database-MariaDB-003545?style=for-the-badge&logo=mariadb&logoColor=white" alt="Database README"/>
  </a>
  &nbsp;
  <a href="#">
    <img src="https://img.shields.io/badge/Figma-Design-F24E1E?style=for-the-badge&logo=figma&logoColor=white" alt="Figma Design"/>
  </a>
</p>

<br>

## 🏛️ 아키텍처

```mermaid
graph TD
    subgraph "User Interaction"
        User[👤 User]
    end

    subgraph "Frontend (Client)"
        Client[📱<br>React / Vite]
    end

    subgraph "Backend (Server)"
        Server[⚙️<br>Node.js / Express]
        WebSocket[⚡️<br>Socket.IO / WebRTC]
    end

    subgraph "Data Layer"
        DB[🗄️<br>MariaDB]
        Redis[💾<br>Redis]
        MinIO[📦<br>MinIO]
    end

    subgraph "External Services"
        AuthServices[🔑<br>Firebase / Kakao Auth]
    end

    User -- "Interacts with" --> Client
    Client -- "REST API (HTTP)" --> Server
    Client -- "Real-time (WebSocket)" --> WebSocket
    Server -- "CRUD" --> DB
    Server -- "Caching / Sessions" --> Redis
    Server -- "File Storage" --> MinIO
    WebSocket -- "Real-time Events" --> Server

    Client -- "OAuth Login Request" --> AuthServices
    Server -- "Verify Token" --> AuthServices
```

---

## ✨ 주요 기능

- **스터디 그룹**: 누구나 쉽게 스터디를 만들고 참여자를 모집할 수 있습니다.
- **실시간 채팅**: 스터디 멤버들과 아이디어를 공유하고 파일을 주고받으세요.
- **화상 스터디**: WebRTC 기반의 화상 통화로 원격 스터디를 진행할 수 있습니다.
- **일정 관리**: 스터디별 캘린더로 중요한 일정을 놓치지 마세요.
- **프로필**: 나를 표현하고 다른 스터디 멤버들을 확인하세요.

## 🛠️ 기술 스택

- **Frontend**: React, Vite
- **Backend**: Node.js, Express, Socket.IO, WebRTC
- **Database**: MariaDB
- **Authentication**: JWT, Firebase, Kakao OAuth
- **Deployment**: Docker, Nginx
