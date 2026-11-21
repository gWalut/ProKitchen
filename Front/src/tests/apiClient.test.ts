import { ApiClient } from '@/api/client';

const tokens = { accessToken: 'new-access', refreshToken: 'new-refresh' };
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

describe('ApiClient session recovery', () => {
    const originalFetch = global.fetch;
    let fetchMock: jest.Mock;
    beforeEach(() => {
        localStorage.setItem('accessToken', 'old-access');
        localStorage.setItem('refreshToken', 'old-refresh');
        fetchMock = jest.fn();
        global.fetch = fetchMock;
    });
    afterEach(() => { global.fetch = originalFetch; });

    it('normalizes a JSON response after refreshing the access token', async () => {
        fetchMock.mockResolvedValueOnce(json({}, 401)).mockResolvedValueOnce(json({ data: tokens }))
            .mockResolvedValueOnce(json({ data: [{ id: 1 }], message: 'ok' }));
        const result = await new ApiClient().fetch('/custom-dishes');
        expect(result).toEqual({ data: [{ id: 1 }], message: 'ok' });
        expect(fetchMock.mock.calls[2][1].headers.Authorization).toBe('Bearer new-access');
    });

    it('preserves a PDF binary response after token refresh', async () => {
        fetchMock.mockResolvedValueOnce(json({}, 401)).mockResolvedValueOnce(json({ data: tokens }))
            .mockResolvedValueOnce(new Response(new Blob(['%PDF-1.4'], { type: 'application/pdf' }), { headers: { 'Content-Type': 'application/pdf' } }));
        const result = await new ApiClient().fetch<Blob>('/custom-dishes/1/label', { responseType: 'blob' });
        expect(result).toBeInstanceOf(Blob);
        expect(result.type).toBe('application/pdf');
    });

    it('keeps the refreshed session if the retried request fails validation', async () => {
        fetchMock.mockResolvedValueOnce(json({}, 401)).mockResolvedValueOnce(json({ data: tokens }))
            .mockResolvedValueOnce(json({ message: 'Invalid weight' }, 400));
        await expect(new ApiClient().fetch('/custom-dishes/1/label')).rejects.toThrow('Invalid weight');
        expect(localStorage.getItem('refreshToken')).toBe('new-refresh');
    });

    it('clears tokens when refresh fails', async () => {
        fetchMock.mockResolvedValueOnce(json({}, 401)).mockResolvedValueOnce(json({}, 401));
        await expect(new ApiClient().fetch('/custom-dishes')).rejects.toThrow();
        expect(localStorage.getItem('accessToken')).toBeNull();
    });

    it('recovers an unreadable access token before restoring the protected route', async () => {
        fetchMock.mockResolvedValueOnce(json({ data: tokens }));
        expect(await new ApiClient().initialize()).toBe(true);
        expect(localStorage.getItem('accessToken')).toBe('new-access');
    });
});
