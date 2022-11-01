# LeetNode: An Adaptive Learning Software

## Overview

Every student learns at a different pace.  Some students may grasp concepts more easily, while others may require extra coaching and practice before they could grasp the concepts. The traditional teaching style typically provides a "one-size-fits-all" learning experience. It is usually targeted at the average student, which might bore the faster students, while leaving the slower students struggling to catch up. "Adaptive learning", on the other hand, addresses the needs of each student through real-time feedback, and adapts the teaching pace and content sequences accordingly. This approach usually provides better learning experiences and results.

Electrical circuit principles, which are taught in the freshmen year for both electrical and computer engineering programmes, are important foundational knowledge for several other modules. It is observed that students who do not have a good grasp of these principles tend to struggle in the subsequent modules. The objective of this capstone project is to develop an adaptive learning software that teaches electrical circuit principles, so as to help as many students as possible to grasp these important fundamental concepts.

The four students in this capstone project will jointly develop the software tool, consisting of the following key parts:

1. User interface
2. Backend server
3. Adaptive learning algorithm
4. Content development & automated question bank

The adaptive learning software tool has great potential for the following:

- Being adopted by modules in NUS that teach electrical circuit principles
- Being adopted in other local and international universities/high schools
- Commercialisation of adaptive learning platform

## Tech Stack (Reference: T3-Stack)

### Frontend

- NextJS (ReactJS)
- Tailwind CSS
- Mantine Component Library

### Backend

- TypeScript
- Routing, REST API, etc.: NextJS
- React Query
- Zod

### Database

- Relational DB: MySQL
- ORM: Prisma

### Authentication

- NextAuth

### Recommender Microservice

- Machine Learning: pyBKT
- FastAPI
- Docker

### Hosting

- Web: Vercel
- Database: PlanetScale
- Media: Cloudinary
- Recommender Microservice: Heroku
- Recommender Pickle Models: Firebase

### Miscellaneous

- Schema Design: Mermaid & Draw.io
- UI/UX Design: Figma
- Project Management: Notion

## Schema Design (Made with Mermaid)

```mermaid
erDiagram
  Account }|--|| User : has
  Session }|--|| User : has
  User ||--o{ Post : writes
  Post ||--o{ PostMedia : has
  User ||--|{ Mastery : has
  User ||--o{ Attempt : attempts
  User ||--|{ UserCourseQuestion : has
  Mastery }|--|| Topic : in
  Attempt }o--|| Question : answers
  Attempt }|--|| Answer : chooses
  Question ||--|{ Answer : has
  Question ||--o{ QuestionMedia : has
  QuestionWithAddedTime }|--|| Question : is
  UserCourseQuestion ||--|{ QuestionWithAddedTime : has
  UserCourseQuestion }|--|| Course : has
  Course }|--|{ Topic : has
  Topic ||--|{ Question : has

  User {
    string id PK
    string nusnetId
    string name
    string email
    datetime emailVerified
    string image
    Role role
  }
  Attempt {
    string attemptId PK
    string userId FK
    int questionId FK
    int attemptOption FK
    bool isCorrect
    datetime submittedAt
    int attemptSeconds
  }
  Course {
    string courseSlug PK
    string courseName
    string courseDescription
    string courseImage
    Level courseLevel
    CourseType type
    string moduleCode
    string moduleTitle
    int week
    int studio
    string slide
    string video
    string markdown
  }
  UserCourseQuestion {
    string userId FK
    string courseSlug FK
    int courseCompletion
  }
  Mastery {
    string userId FK
    string topicSlug FK
    float masteryLevel
  }
  Topic {
    string topicSlug PK
    string topicName
    Level topicLevel
  }
  QuestionWithAddedTime {
    int questionId FK
    string userId FK
    string courseSlug FK
    datetime addedTime
  }
  Question {
    int questionId PK
    int variationId
    string topicSlug
    string questionContent
    QuestionDifficulty questionDifficulty
  }
  QuestionMedia {
    int questionId FK
    string questionMediaURL FK
  }
  Answer {
    int questionId FK
    int optionNumber FK
    string answerContent
    bool isCorrect
  }
  Post {
    string postId PK
    string userId FK
    string title
    string message
    int likes
    datetime createdAt
    datetime updatedAt
  }
  PostMedia {
    string postId FK
    string postMediaURL FK
  }
```

## UI/UX Design

[Figma Mockup](https://www.figma.com/proto/Alagss66v74gG2fi8MjP7C/UIUX?node-id=12%3A6&scaling=scale-down&page-id=0%3A1&starting-point-node-id=12%3A6 "LeetNode's Figma Mockup")

## The Team

- [Zac Zher Min](https://www.linkedin.com/in/tamzhermin/)
- [Mingzhe](#)
- [Jasmine](#)
- [Angelina](#)
