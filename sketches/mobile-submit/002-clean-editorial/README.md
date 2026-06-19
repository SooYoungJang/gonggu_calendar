## Variant: Clean Editorial (Mobile Submit)

### Design stance
Notion/Linear 스타일의 차분하고 여백이 많은 에디토리얼 접근. 단계 표시기(progress step)로 긴 폼의 완성도를 시각화, 필수/선택 섹션 명확히 분리, DM Sans로 부드러운 인상. 읽기 편하고 인지 부하가 낮은 것이 핵심.

### Key choices
- **Layout**: 필드셋으로 필수/선택 그룹핑, 진행 단계 바, 중앙 정렬 헤더
- **Typography**: DM Sans (Google Fonts), 32px 헤드라인, 16px 본문, 14px 라벨
- **Color**: 파란색(#0066ff) 액센트, 회색 베이스, 시맨틱 색상 분리, 연한 배경으로 카드 구분
- **Interaction**: 문자 수 실시간 카운트, 단계 자동 진행, 포커스 시 링 그림자, 키보드 Enter 네비게이션
- **Spacing**: 24px 기본 여백, 28px 섹션 간격, 20px 필드 간격 (더 여유로움)

### Trade-offs
- **Strong at**: 긴 폼에서의 진행도 인지, 가독성, 안정감 있는 브랜드 인상, 접근성(진행률 ARIA)
- **Weak at**: 화면 세로 길이 증가(스크롤 더 필요), 모바일에서 한 화면에 보이는 필드 수 적음

### Best for
- 처음 접하는 사용자, 정확한 입력이 중요한 제보, 브랜드 신뢰도 강조가 필요한 경우, 웹/모바일 공통