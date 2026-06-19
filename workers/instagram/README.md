# Instagram Worker

`instagrapi`로 등록된 인플루언서의 최근 게시물을 수집해 API의 `POST /raw-posts/collect`로 전송합니다.

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r workers/instagram/requirements.txt
cp .env.example .env
```

필수 환경변수:

- `INSTAGRAM_USERNAME`
- `INSTAGRAM_PASSWORD`
- `API_INTERNAL_BASE_URL`

선택 환경변수:

- `INSTAGRAM_PROXY_URL`
- `INSTAGRAM_SESSION_FILE`
- `INSTAGRAM_POLL_INTERVAL_SECONDS`

## Run

```bash
npm run worker:instagram
```

Instagram은 자동화 접근에 민감하므로, 실제 운영에서는 낮은 주기, 세션 재사용, 프록시, 계정 보호 정책을 반드시 별도로 설계해야 합니다.
