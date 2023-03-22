REPO=harbor.liebi.com/vfil
BUILD_VERSION   := $(shell git log -1 --pretty='%h')
NAMESPACE := vfil
NAMESPACE-PROC := vfil-proc

IMAGE=${REPO}/vfil-subql:${BUILD_VERSION}


build:
	docker build -f Dockerfile -t ${IMAGE} .
	docker push ${IMAGE}

deploy-test: build
	kubectl apply -f deploy/test

update: build
	kubectl set image deploy -n ${NAMESPACE} vfil1-subql vfil1-subql=${IMAGE}
	kubectl set image deploy -n ${NAMESPACE} vfil2-subql vfil2-subql=${IMAGE}
	kubectl set image deploy -n ${NAMESPACE} vfil3-subql vfil3-subql=${IMAGE}
	kubectl rollout restart deploy -n ${NAMESPACE} vfil1-subql vfil2-subql vfil3-subql

update-proc: build
	kubectl set image deploy -n ${NAMESPACE-PROC}  vfil1-subql vfil1-subql=${IMAGE}
	kubectl set image deploy -n ${NAMESPACE-PROC}  vfil2-subql vfil2-subql=${IMAGE}
	kubectl set image deploy -n ${NAMESPACE-PROC}  vfil3-subql vfil3-subql=${IMAGE}
	kubectl set image deploy -n ${NAMESPACE-PROC}  vfil4-subql vfil4-subql=${IMAGE}
	kubectl rollout restart deploy -n ${NAMESPACE-PROC}  vfil1-subql vfil2-subql vfil3-subql vfil4-subql

restart-proc-only:
	kubectl rollout restart deploy -n ${NAMESPACE-PROC}  vfil1-subql vfil2-subql vfil3-subql vfil4-subql
