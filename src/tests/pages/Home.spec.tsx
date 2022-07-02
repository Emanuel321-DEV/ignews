import { render, screen } from '@testing-library/react';
import { mocked } from 'jest-mock';
import { useSession } from 'next-auth/react';
import Home, { getStaticProps } from '../../pages';
import { stripe } from "../../services/stripe";


jest.mock('next/router');
jest.mock('next-auth/react');
jest.mock('../../services/stripe');

describe('Home Page', () => {
	it('renders correctly', () => {
		const useSessionMocked = jest.mocked(useSession);

		useSessionMocked.mockReturnValueOnce({
			data: null,
			status: 'loading',
		});

		render(<Home product={{ amount: '$10.00', priceId: 'fake-id' }} />);

		expect(screen.getByText('for $10.00 month')).toBeInTheDocument();
	});

	it("Stripe connection", async () => {
		const retrieveStripePricesMocked = mocked(stripe.prices.retrieve)

		// Isso retorna uma promisse, por isso o resolved
		retrieveStripePricesMocked.mockResolvedValueOnce({
			id: 'fake-price-id',
			unit_amount: 1000,
		} as any)

		const response = await getStaticProps({});

		expect(response).toEqual(
			expect.objectContaining({ 
				props: {
					product: { 
						priceId: 'fake-price-id',
						amount: '$10.00'
					}
				}
			})
		)


	})
	
});