---
title: 'AWS Certified Developer – Associate (DVA-C02) 필기'
slug: 'aws_dva_c02_memo'
description: 'DVA-C02 시험 준비용 개인 메모. 도메인별 키워드와 헷갈리는 포인트를 정리한다.'
categories: ['Study']
keywords: ['AWS', 'DVA-C02', 'Certified Developer Associate']
visibility: private
createdTime: '2026-08-30T09:00:00.000Z'
lastEditedTime: '2026-08-30T09:00:00.000Z'
---

## 시험 개요

- 코드: **DVA-C02**
- 초점: 개발자 관점의 AWS 서비스 활용 (배포, SDK, 보안, 트러블슈팅)
- 이 글은 공개 블로그가 아니라 `visibility: private` 필기용 예제다.

## 도메인 체크리스트 (초안)

1. **Development with AWS Services** — Lambda, API Gateway, DynamoDB, S3
2. **Security** — IAM 최소 권한, Secrets Manager / Parameter Store, Cognito
3. **Deployment** — CodePipeline / CodeBuild / CodeDeploy, Elastic Beanstalk, CloudFormation / SAM / CDK
4. **Troubleshooting & Optimization** — CloudWatch, X-Ray, 재시도·멱등성

## 헷갈리기 쉬운 포인트

| 주제 | 메모 |
| --- | --- |
| Secrets Manager vs Parameter Store | 시크릿 로테이션·유료 시크릿 → Secrets Manager / 단순 설정·계층 파라미터 → SSM |
| SQS 표준 vs FIFO | 표준: 최소 1회·높은 처리량 / FIFO: 정확히 1회·순서 보장 |
| API Gateway REST vs HTTP | HTTP API가 저렴·빠름. WebSocket·일부 고급 기능은 REST |
| Lambda 동시성 | Reserved vs Provisioned. Cold start는 SnapStart / Provisioned concurrency |

## 다음에 적을 것

- [ ] IAM 정책 Condition 키 자주 나오는 패턴
- [ ] DynamoDB 단일 테이블 vs GSI 설계 질문
- [ ] SAM `AWS::Serverless::Function` 이벤트 소스 매핑
