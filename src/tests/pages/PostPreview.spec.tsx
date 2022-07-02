import { render, screen } from '@testing-library/react';
import { useSession } from 'next-auth/react'
import { mocked } from 'jest-mock';
import Post, { getStaticProps } from '../../pages/posts/preview/[slug]';
import { getPrismicClient } from '../../services/prismic';
import { useRouter } from 'next/router';

jest.mock('../../services/stripe')

const post = {
    slug: 'my-new-post',
    title: 'My New Post',
    content: '<p>Post content</p>',
    updatedAt: '2021-01-01',
};

jest.mock("next-auth/react");
jest.mock('next/router')
jest.mock('../../services/prismic')

describe('Post preview page', () => {

    it('renders correctly', () => {
        const useSessionMocked = mocked(useSession)
        const useRouterMocked = mocked(useRouter)

        useSessionMocked.mockReturnValueOnce([null, false] as any)

        render(<Post post={post} />);

        expect(screen.getByText("My New Post")).toBeInTheDocument();
        expect(screen.getByText('Post content')).toBeInTheDocument();
        expect(screen.getByText('Wanna continue reading ?')).toBeInTheDocument();
    });

    it("redirects user to full post when user is subscribed", async () => {
        const useSessionMocked = mocked(useSession);
        const useRouterMocked = mocked(useRouter);
        const pushMock = jest.fn()
    
        useSessionMocked.mockReturnValueOnce({
            data: {
                activeSubscription: 'fake-active-subscription',
                expires: null
            },
            status: 'authenticated'
        });
    
        useRouterMocked.mockReturnValueOnce({
          push: pushMock,
        } as any)
    
        render(<Post post={post} />);
    
        expect(pushMock).toHaveBeenCalledWith('/posts/my-new-post')
      });
      
    it('loads initial data', async () => {
        const getPrismicClientMocked = mocked(getPrismicClient);

        getPrismicClientMocked.mockReturnValueOnce({
            getByUID: jest.fn().mockResolvedValueOnce({
               data: {
                title: [
                    {type: 'heading', text: 'My new post'}
                ],
                content: [
                    { type: 'paragraph', text: 'Post content'}
                ],
            },
            last_publication_date: '01-01-2021'
        })
        } as any);

       const response = await getStaticProps({ params: { slug: 'my-new-post' }})

    expect(response).toEqual(
        expect.objectContaining({
            props: {
                post: {
                    slug: 'my-new-post',
                    title: 'My new post',
                    content: '<p>Post content</p>',
                    updatedAt: '01 de janeiro de 2021'
                }
            }
        })
    )
    });
 });