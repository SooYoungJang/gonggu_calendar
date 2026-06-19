## Variant: Dense Utilitarian (Web Admin Submissions)

### Design stance
Superhuman/Linear/Raycast 스타일의 고밀도 관리자 패널. 사이드바 + 테이블 + 우측 슬라이드오버 사이드 패널(모달 대체), 밀도 토글(컴팩트/여유), IBM Plex Sans/Mono로 기술적 정밀함 강조. 키보드 중심 워크플로, 한 화면 최대 정보량.

### Key choices
- **Layout**: 고정 사이드바(240px) + 테이블 + 우측 사이드 패널(420px), 모달 없음
- **Typography**: IBM Plex Sans 18/13/12/11/10px, IBM Plex Mono 날짜/ID, 대문자 라벨
- **Color**: 파란색(#0066cc) 액센트, 연한 패널 배경, 최소 색상, 시맨틱 배지
- **Interaction**: 행 클릭/Enter 사이드 패널 오픈, 체크박스 다중 선택, 밀도 토글, 빠른 반려 칩, 사이드 패널 내 승인/반려/편집
- **Spacing**: 10px 테이블 패딩, 12px 기본, 8px 밀도 조절

### Trade-offs
- **Strong at**: 초고밀도 스캔, 키보드 전용 조작, 사이드 패널로 컨텍스트 유지, 파워유저 효율 극대화
- **Weak at**: 초보자 진입 장벽, 터치 타겟 작음(모바일), 시각적 위계 약함

### Best for
- 일일 100+건 고속 처리 운영팀, 키보드 단축키 숙련자, 다중 모니터 환경, 실시간 모니터링 대시보드 병행