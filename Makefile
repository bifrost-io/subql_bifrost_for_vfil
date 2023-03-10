REPO=harbor.liebi.com/vfil
BUILD_VERSION   := $(shell git log -1 --pretty='%h')
NAMESPACE := vfil
NAMESPACE-test := vfil-test

IMAGE=${REPO}/vfil-subql:${BUILD_VERSION}


build:
	docker build -f Dockerfile -t ${IMAGE} .
	docker push ${IMAGE}

deploy: build
	kubectl apply -f deploy/
	# kubectl set image deploy -n ${NAMESPACE} vfil4-subql vfil4-subql=${IMAGE}
	# kubectl set image deploy -n ${NAMESPACE} vfil5-subql vfil5-subql=${IMAGE}

update: build
	kubectl set image deploy -n ${NAMESPACE} vfil1-subql vfil1-subql=${IMAGE}
	kubectl set image deploy -n ${NAMESPACE} vfil2-subql vfil2-subql=${IMAGE}
	kubectl set image deploy -n ${NAMESPACE} vfil3-subql vfil3-subql=${IMAGE}
	kubectl rollout restart deploy -n ${NAMESPACE} vfil1-subql vfil2-subql vfil3-subql 