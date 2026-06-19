import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'admin@gonggu.local';
const ADMIN_PASSWORD = 'Admin123!@#';
const BASE_URL = 'http://localhost:3000';
const API_BASE = 'http://localhost:3003';

test.describe('Login Page Rendering', () => {
  test('로그인 페이지 정상 렌더링', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/login`);
    await expect(page.locator('h1')).toContainText('관리자 로그인');
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('로그인');
  });
});

test.describe('Login Form Validation', () => {
  test('빈 폼에서 제출 시 에러 메시지 표시', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/login`);
    await page.click('button[type="submit"]');
    const alertBox = page.locator('.bg-red-50');
    await expect(alertBox).toBeVisible({ timeout: 5000 });
    await expect(alertBox).toContainText(/이메일을 입력|비밀번호를 입력/);
  });
});

test.describe('API Auth Flow', () => {
  test('올바른 자격증명으로 로그인 API 호출 성공', async ({ page }) => {
    // API를 직접 호출하여 인증 플로우 검증
    const response = await page.request.post(`${API_BASE}/api/v1/auth/login`, {
      data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.accessToken).toBeTruthy();
    expect(body.accessToken).toMatch(/^eyJ/);
    expect(body.user.email).toBe(ADMIN_EMAIL);
  });

  test('잘못된 비밀번호로 API 호출 시 401', async ({ page }) => {
    const response = await page.request.post(`${API_BASE}/api/v1/auth/login`, {
      data: { email: ADMIN_EMAIL, password: 'WrongPassword123!' },
    });
    expect(response.status()).toBe(401);
  });

  test('잘못된 이메일로 API 호출 시 401', async ({ page }) => {
    const response = await page.request.post(`${API_BASE}/api/v1/auth/login`, {
      data: { email: 'wrong@test.com', password: ADMIN_PASSWORD },
    });
    expect(response.status()).toBe(401);
  });
});

test.describe('Admin Route Protection', () => {
  test('토큰 없이 /admin/submissions 접근 시 로그인 페이지로 리다이렉트', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/submissions`);
    await page.waitForTimeout(3000);
    // 클라이언트 가드가 리다이렉트했는지 확인
    const currentUrl = page.url();
    expect(currentUrl).toContain('/admin/login');
  });
});

test.describe('Accessibility Checks', () => {
  test('필수 필드에 aria-required 속성', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/login`);
    await expect(page.locator('input[id="email"]')).toHaveAttribute('aria-required', 'true');
    await expect(page.locator('input[id="password"]')).toHaveAttribute('aria-required', 'true');
  });

  test('label과 input id 연결', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/login`);
    await expect(page.locator('label[for="email"]')).toBeVisible();
    await expect(page.locator('label[for="password"]')).toBeVisible();
  });
});