---
title: 'DVA-C02 container'
slug: 'aws_container'
description: 'DVA-C02용 Docker / ECS / EKS / ECR 필기'
categories: ['Study']
keywords: ['AWS', 'DVA-C02', 'Certified Developer Associate', 'ECS', 'EKS', 'ECR']
visibility: private
createdTime: '2026-08-30T09:00:00.000Z'
lastEditedTime: '2026-09-05T10:00:00.000Z'
---

## Docker

앱을 **컨테이너**로 패키징해서 OS/환경이 달라도 동일하게 실행한다.

### Docker image

- 이미지는 **레지스트리(repository)** 에 저장한다.
- Docker Hub (`hub.docker.com`) — 퍼블릭. OS·런타임 베이스 이미지를 많이 가져온다.
- **ECR (Elastic Container Registry)** — AWS 관리형 레지스트리.
  - 보통 **프라이빗** 저장소로 쓰지만, **ECR Public** 도 있다.
  - ECS/EKS가 이미지를 pull 할 때 자주 쓴다.

### Docker vs VM

|      | VM                              | Container                                   |
| ---- | ------------------------------- | ------------------------------------------- |
| 구조 | Hypervisor 위에 Guest OS + Apps | Host OS 위에 Docker Daemon + Containers     |
| 무게 | Guest OS까지 포함 → 무거움      | 커널은 호스트 공유 → 가벼움                 |
| 밀도 | 서버당 VM 수 제한적             | 같은 서버에 컨테이너를 더 많이 띄울 수 있음 |

비슷해 보이지만, 컨테이너는 **Guest OS를 통째로 안 올린다.**

---

## AWS에서 컨테이너 관리

| 서비스  | 역할                                   |
| ------- | -------------------------------------- |
| **ECS** | AWS 고유 API로 컨테이너 오케스트레이션 |
| **EKS** | Kubernetes(오픈소스)를 관리형으로      |
| **ECR** | 컨테이너 이미지 저장소                 |

---

## ECS (Elastic Container Service)

클러스터 위에서 **Task**(컨테이너 정의 단위) / **Service**(원하는 Task 수 유지) 를 돌린다.

### 1) EC2 launch type

- 내가 **EC2 인스턴스를 프로비저닝**한다. (용량을 내가 준비)
- 각 EC2에 **ECS agent** 가 떠서 클러스터에 등록된다.
- ECS가 그 위에 Task(컨테이너)를 시작/정지한다.
- 인프라(인스턴스) 관리는 내 몫.

### 2) Fargate launch type

- **Serverless** — 인프라를 프로비저닝하지 않는다.
- EC2가 생겼는지/어디에 있는지 몰라도 된다.
- Task에 필요한 **CPU / Memory** 만 지정하면 ECS가 Task를 실행한다.
- 스케일아웃 = EC2를 늘리는 게 아니라 **Task 수를 늘린다.**

---

## ECS IAM roles (시험 포인트)

역할을 **누가 쓰는지**로 구분한다.

### EC2 Instance Profile (EC2 launch type 전용)

- EC2 위의 **ECS agent** 가 사용.
- 클러스터 등록, ECS API 호출 등 **인스턴스/에이전트** 권한.
- Fargate에는 EC2가 없으므로 이 프로필이 없다.

### Task Execution Role (실행 역할)

- Task를 **띄우는 쪽**(agent / Fargate)이 사용.
- 대표 권한:
  - ECR에서 이미지 pull
  - CloudWatch Logs로 컨테이너 로그 전송
  - Secrets Manager / SSM Parameter Store에서 **시작 시 시크릿 주입**

### Task Role (태스크 역할)

- **컨테이너 안 애플리케이션 코드**가 사용.
- 예: S3 업로드, DynamoDB read/write, SQS 호출.
- Task(서비스)마다 다른 Task Role을 줄 수 있다.

요약: **Execution Role = 인프라가 Task를 돌리기 위한 권한**, **Task Role = 앱이 AWS API를 칠 권한**.

---

## Host port / Container port

Task Definition의 port mapping.

| 용어              | 의미                                                        |
| ----------------- | ----------------------------------------------------------- |
| **containerPort** | 컨테이너 **안에서** 앱이 listen 하는 포트 (예: Node가 8080) |
| **hostPort**      | EC2 **호스트**에 열어 컨테이너 포트로 연결하는 포트         |

- EC2 launch type + bridge 모드: `hostPort:containerPort` 매핑 (예: `80:8080`).
- **동적 포트 매핑**: `hostPort` 를 `0`(또는 생략)으로 두면 호스트 포트를 랜덤 할당 → **ALB target group** 이 알아서 등록. 같은 인스턴스에 동일 containerPort Task를 여러 개 올릴 때 필요.
- **awsvpc** / **Fargate**: 태스크마다 ENI. 보통 hostPort ≈ containerPort. ALB는 타겟을 Task IP:containerPort 로 잡는다.

시험: “여러 Task를 한 EC2에” → 동적 포트 + ALB. “Fargate” → host 포트 고민 거의 없음.

---

## Placement strategy: binpack

ECS가 Task를 **어느 EC2에 올릴지** 정하는 전략 중 하나.

| 전략        | 의미                                                                                           |
| ----------- | ---------------------------------------------------------------------------------------------- |
| **binpack** | CPU/메모리 여유를 보고 **이미 쓰이는 인스턴스에 최대한 빽빽히** 채움 → 인스턴스 수·비용 최소화 |
| **spread**  | AZ/인스턴스에 **골고루** 분산 → 가용성                                                         |
| **random**  | 랜덤                                                                                           |

binpack = 짐 가방(bin)에 물건을 꽉 채우듯 **자원을 낭비하지 않게 패킹**. Fargate는 EC2를 고르지 않으므로 이 전략의 의미가 EC2 launch type에 더 크다.

---

## ECS Service Auto Scaling

**Application Auto Scaling** 이 **Task 수**를 조절한다. (EC2 Auto Scaling과 다름)

메트릭 예:

- CPU utilization
- Memory utilization
- ALB Request Count Per Target

정책:

- **Target tracking** — 특정 CloudWatch 메트릭을 목표값에 맞춤
- **Step scaling** — 알람 구간별로 가감
- **Scheduled scaling** — 날짜/시간에 맞춰 스케일

```
ECS Service Auto Scaling  = Task 개수
EC2 Auto Scaling          = EC2 인스턴스 개수 (EC2 launch type 클러스터 용량)
```

EC2 launch type에서 Task만 늘리면 인스턴스 CPU/메모리가 부족할 수 있다 → 클러스터 용량(ASG)도 같이 봐야 한다. Fargate는 Task만 늘리면 된다.

---

## ECS rolling update (배포)

Service의 deployment configuration:

- **minimumHealthyPercent** — 배포 중 유지할 최소 healthy Task 비율
- **maximumPercent** — 배포 중 허용할 최대 Task 비율 (desired 대비)

예:

| min / max       | 동작                                                                                                                    |
| --------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **50% / 100%**  | desired 이상 못 올림 → 새 Task 전에 옛 Task를 먼저 줄임. 용량 절약, **일시적 용량 감소** 가능                           |
| **100% / 150%** | healthy를 100% 유지하며 잠시 150%까지 올림 → 새 Task 기동 후 옛 Task 제거. **무중단에 가깝고** 일시적으로 리소스/비용 ↑ |

시험: “다운타임 없이” ≈ min 100% + max > 100%. “여유 용량 없음” ≈ max 100%.

---

## EventBridge → ECS Task

EventBridge 규칙 타겟으로 **ECS Task** 를 지정할 수 있다.

- 스케줄(`rate`/`cron`) 또는 이벤트(예: S3, CodePipeline) 발생 시 Task 1회 실행
- 상시 Service가 아니라 **배치성/이벤트 드리븐** 작업에 적합
- Task Definition + (필요 시) 네트워크 구성·IAM을 규칙에 연결

---

## EKS (Elastic Kubernetes Service)

**Kubernetes** = 컨테이너 앱의 배포·스케일·운영을 위한 오픈소스 오케스트레이터.

- ECS와 **목적(컨테이너 오케스트레이션)은 비슷**하지만 **API/개념이 다름** (Pod, Deployment, Service, kubectl…).
- 컨트롤 플레인은 AWS가 관리.
- 워커:
  - **EC2** — 노드 직접 운영
  - **Fargate** — 파드 단위 서버리스

멀티 클라우드/기존 K8s 인력·툴링이면 EKS, AWS에 깊게 붙고 단순하면 ECS 쪽이 시험·실무 모두에서 자주 대비된다.
