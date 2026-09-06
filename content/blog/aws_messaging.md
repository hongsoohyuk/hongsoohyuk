---
title: 'DVA-C02 messaging'
slug: 'DVA-C02_messaging'
description: ''
categories: ['Study']
keywords: ['AWS', 'DVA-C02', 'Certified Developer Associate']
visibility: private
createdTime: '2026-08-30T09:00:00.000Z'
lastEditedTime: '2026-08-30T09:00:00.000Z'
---

## SQS

Simple Queue Service
provider 로 부터 consumer 에게 메세징을 하기 위한 서비스 중 하나.
동기 방식은 traffic이 급증하는 경우 대응이 어렵다.

decouple 을 위해 비동기 방식을 사용하며, sqs, sns, kinesis 가 그것들.

sqs 는 큐. 프로바이더가 메세지를 큐에 쌓으면 컨슈머가 polling 으로 자신에게 온 메세지가 있는지 확인한다.
갯수는 제한이 없고, 리텐션이 있음. 256kb 제한이 있고 중복 메세지가 가능하다.

컨슈머는 메세지를 읽고 삭제.

여러개의 컨슈머가 존재하고, queue 안에 있는 메세지를 처리할때 중복으로 메세지 수신하고 처리하지 않기 위해 삭제처리한다.

컨슈머를 scaling 해서 큐에 더 많은 메세지를 쌓을 수 있도록함.

### SQS Scaling (시험에 물어볼만한 내용)

1. auto scaling group asg 안에 있는 ec2 가 컨슈머.
2. cloudwatch metric - ApproximateNumberOfMessages
3. cloudwatch alarm
4. asg 에 capacity 확장 요청

### SQS tiers (시험에 물어볼만한 내용)

example

1. web service ec2 하나에서 비디오 처리 요청을 한다면 웹사이트가 느려질것.
2. asg 내부 frontend ec2 가 scaling accordingly, Send Message to SQS
3. asg 내부 video processing backend 가 scaling accordingly, ReceiveMessages from SQS
4. s3 insert

### SQS security

encryption

- encryption HTTPS api
- at-rest encryption KMS keys
- client side encryp, if client en/de cryption

Access Controls.

SQS Access Policies

- cross-account access to SQS
  - 다른 계정의 s3 가 sqs 에 접근해 파일이 업로도ㅡ 됐다는 메세지를 작성할 수 있다.
  - 다른 계정의 ec2 가 sqs 에 접근해 메세지를 수신하도록 할 수 있다.

- allow other Service (SNS, S3...) to an SQS queue

## SQS 가시성 타임아웃

컨슈머가 poll 하는 경우에. 기본적인 30초 visivity timeout 로 인해 다른 컨슈머에겐 더이상 보이지 않음. 30초 이내에 처리되어야한다.

가시성 타임아웃이 끝난 다음 다시 큐에 나타나 다른 컨슈머에게 소비된다. (같은 메세지임.)

그래서 타임아웃보다 더 처리시간이 필요하다면, ChangeMessageVisibility api 로 시간을 추가로 설정한다.

시간이 너무 긴 경우에 프로세스가 깨진 경우재처리에 필요한 대기시간이 너무 길고, 짧다면 중복처리 될 수 있다.

## DLQ Dead Letter Queue

- 타임아웃 동안 컨슈머가 일을 처리하지 못하면? 메세지에 큐가 다시 올라간다.
- 얼마나 많이 큐에 다시 올라갈 수 있는지 임계점을 정해야함
- ManimumReceive
- 큐 제한을 초과한 메세지들은 DLQ 로 간다.

### 쓰는 이유

- 디버깅에 유용.
- 메세지 리텐션(기본 14일) 안에 프로세스 하도록 격리

### Redrive to Source

- 컨슈머(코드)를 수정하고 다시 queue에 올려놔서 프로세스되도록 함.

### Delay Queue

메세지 등장 지연시간(기본값 0초), 최대 15분 설정 가능

### Long Polling

- 컨슈머가 메세지를 polling 하는데, 아직 수신할게 없는경우 연결을 유지한채 좀 더 기다리는것.
- api 콜을 줄이기 위함.
- 어플리케이션의 레이턴시도 줄일 수 있음.

### Standard vs FIFO Queue

- 스탠다드
  - 순서를 보장하지 않음.
  - 대신 높은 처리량
  - 최소 한 번 전달(중복 전달 가능)
  - 확장성 높음.

- 선입선출
  - 순서 보장
  - 중복제거. (같은 메세지 중복처리 예방)
  - 대신 한번에 하나씩 처리됨.
  - 그룹으로 묶였다면 다건 처리도 가능하지만, 그룹별 순서는 보장되지 않음( 그룹 내 순서는 보장됨)

## kinesis data streams

## amazon data firehose

kinesis data stream 등 데이터 생산 유입.

firehose

- 람다로 데이터 변형 처리
- batch 로 버퍼를 비움 (s3, redshift / datadog / http endpoint)
- failed data -> back up s3

## kinesis data streams vs amazon data firehose

스트리밍 데이터 / 스트리밍 데이터를 s3 / redshift / open search 로 로드
생산자와 컨슈머 코드 / 매니지드
실시간 / 거의 실시간

### Amazon managed service for apache Flink

**data streams 프로세스를 위한 프레임워크**

- aws cluster 에 apache flink app 을 실행.
  - automatic scaling, 병렬 연산
  - **important Amazon Data Firehose 로 부터 데이터를 읽지 않음**

# sqs vs sns vs kinesis

SQS

- consumer pull data
- 데이터 소비 후 삭제
- 원하는 컨슈머 만큼 가질 수 있음
- throughput(전송량) provision 불필요, auto scaling 활성화 같은 동작 불필요
- FIFO 큐에서 순서 보장 가능
- 딜레이 기능

SNS

- 다량의 구독자에게 데이터를 push
- 12,500,000 개 구독자까지
- 데이터 유지 불가
- throughput provision 불필요
- sqs 와 조합해 fanout 패턴 가능
- sqs fifo 를 사용해 선입선출 구현 가능

finesis

- pull data
- 키네시스 데이터 스트림의 용량 제한은 스트림 내의 샤드 수로 정의됨.
- 1MS/s 의 들어오는 데이터 , 2MB/s 의 나가는 데이터 허용

이 데이터 스트림은 일반적으로 5MB/s의 데이터를 수신하고 8MB/s를 전송합니다. 때때로 트래픽이 최대 2배까지 급증하고 ProvisionedThroughputExceededException 예외가 발생합니다.
-> 더 많은 샤드 추가

사용자 클릭 순서, 머문 시간, 탐색 등 클릭스트림 데이터 분석을 위해 kinesis 를 사용한다면, 사용자 데이터가 정렬되지 않고 분산될 것. 해결책 -> 각 레코드에대해 사용자 id 를 나타내는 파티션 키 추가.
사용자 id 를 파티션 키로 사용하면 각 사용자의 데이터가 정렬되어 샤드로 전송.
