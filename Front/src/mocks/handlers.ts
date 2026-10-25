import { http, HttpResponse } from 'msw';

// Mock data
const ingredients = [
    {
        id: 1,
        name: 'Томаты',
        calories: 18,
        proteins: 0.9,
        fats: 0.2,
        carbohydrates: 3.9
    },
    {
        id: 2,
        name: 'Куриная грудка',
        calories: 165,
        proteins: 31,
        fats: 3.6,
        carbohydrates: 0
    }
];

export const handlers = [
    // Auth handlers
    http.post('/api/auth/login', async ({ request }) => {
        const body = (await request.json()) as {
            email?: string;
            password?: string;
        };
        const { email, password } = body;

        if (email === 'test@example.com' && password === 'password') {
            return HttpResponse.json({
                token: 'mock-jwt-token',
                user: {
                    id: 1,
                    email: 'test@example.com',
                    name: 'Test User'
                }
            });
        }

        return new HttpResponse(null, {
            status: 401,
            statusText: 'Unauthorized'
        });
    }),

    // Ingredients handlers
    http.get('/api/ingredients', () => {
        return HttpResponse.json(ingredients);
    }),

    http.get('/api/ingredients/search', ({ request }) => {
        const url = new URL(request.url);
        const query = url.searchParams.get('query') || '';

        const filteredIngredients = ingredients.filter(ing =>
            ing.name.toLowerCase().includes(query.toLowerCase())
        );

        return HttpResponse.json(filteredIngredients);
    }),

    // Dishes handlers
    http.get('/api/dishes', () => {
        return HttpResponse.json([
            {
                id: 1,
                name: 'Салат с курицей',
                ingredients: [
                    { ingredientId: 1, amount: 100 },
                    { ingredientId: 2, amount: 150 }
                ]
            }
        ]);
    })
];