## 두부계측분석 인공지능 웹서비스
## Cephalometric Analysis AI Web Service

---

인공지능을 활용해 두부 X-ray 촬영 사진에 두부 계측점 표시를 진행합니다.
각 지점과의 거리, 각도를 통해 정상 지점을 도출하고 현재 지점과 정상 지점까지의 거리를 표시합니다.
이 서비스는 치아 및 골격 관계에 대한 분석을 자동화하고 치과의사, 치열교정의사, 구강악안면외과의사가 치료 계획을 작성하는 데 있어 
편의성을 증대시킬 수 있습니다.

Use artificial intelligence to display head measurement points on head X-ray photographs.
Derive normal points from the distance to each point, angle, and display the distance from the current point to the normal point.
This service automates the analysis of dental and skeletal relationships and enables dentists, orthodontists, or oral maxillofacial surgeons to develop treatment plans
Increase convenience.

---
## 시스템 구성도
### System Configuration

![SystemConfiguration](https://github.com/jy2694/CephalometricAI/blob/main/System.png?raw=true)

---
## 개발자
### Developers

* **최승완(PM)**
  * **원광대학교 컴퓨터소프트웨어공학과(Wonkwang Univ, Dept Computer Software Engineering)**
  * 슈타이너 분석 구현
* **황현성**
  * **원광대학교 컴퓨터소프트웨어공학과(Wonkwang Univ, Dept Computer Software Engineering)**
  * 인공지능 모델 학습 및 데이터 전처리
* **한승용**
  * **원광대학교 컴퓨터소프트웨어공학과(Wonkwang Univ, Dept Computer Software Engineering)**
  * 데이터 전처리 및 검증
* **김제연**
  * **원광대학교 컴퓨터소프트웨어공학과(Wonkwang Univ, Dept Computer Software Engineering)**
  * 데이터베이스 설계(Database Design, 100%)
  * HTTP 통신 구현(HTTP Communication Implement, 80%)
  * Backend 구현(Backend Implement, 80%)
  * Frontend 구현(Frontend Implement, 50%)
* **방현우**
  * **원광대학교 컴퓨터소프트웨어공학과(Wonkwang Univ, Dept Computer Software Engineering)**
  * HTTP 통신 구현(HTTP Communication Implement, 20%)
  * Frontend 구현(Frontend Implement, 50%)
  * Backend 구현(Backend Implement, 20%)

---

## Teck Stack

### 1. Back-End

![JDK](https://img.shields.io/badge/OpenJDK-17-437291?logo=openjdk)

![SpringBoot](https://img.shields.io/badge/Spring_Boot-3.1.4-6DB33F?logo=springboot)

![MariaDB](https://img.shields.io/badge/MariaDB-15.1-003545?logo=mariadb)

![SpringJPA](https://img.shields.io/badge/Hibernate-59666C?logo=hibernate)

### 2. Front-End

![JavaScript](https://img.shields.io/badge/JavaScript-ESNext-F7DF1E?logo=javascript)

![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)

![Axios](https://img.shields.io/badge/Axios-1.5.1-5A29E4?logo=axios)

![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.2-7952B3?logo=bootstrap)


### 3. Artificial Intelligence

![Python](https://img.shields.io/badge/Python-3.8-3776AB?logo=python)

![PyTorch](https://img.shields.io/badge/PyTorch-2.1.0-EE4C2C?logo=pytorch)


