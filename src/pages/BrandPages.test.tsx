import { describe, it, expect } from 'vitest';
import { screen, within } from '@testing-library/react';
import { loginAsDemo, renderWithProviders } from '../test/render';
import { WritersPage } from './WritersPage';
import { WriterPage } from './WriterPage';
import { PublishersPage } from './PublishersPage';
import { PublisherPage } from './PublisherPage';

describe('WritersPage', () => {
  it('lists all writers for guests, without "Your writers"', async () => {
    renderWithProviders(<WritersPage />);
    const all = await screen.findByRole('region', { name: 'All writers' });
    expect(await within(all).findByRole('link', { name: /Daniel Reed/ })).toHaveAttribute(
      'href',
      '/writers/daniel-reed'
    );
    expect(screen.queryByRole('region', { name: 'Your writers' })).not.toBeInTheDocument();
  });

  it('shows the writers of the books the customer ordered', async () => {
    loginAsDemo();
    renderWithProviders(<WritersPage />);
    const mine = await screen.findByRole('region', { name: 'Your writers' });
    expect(await within(mine).findByRole('link', { name: /Arjun Patel/ })).toBeInTheDocument();
    expect(within(mine).getByRole('link', { name: /Ananya Rao/ })).toBeInTheDocument();
  });
});

describe('WriterPage', () => {
  it('shows the profile and the writer’s books', async () => {
    renderWithProviders(<WriterPage />, { route: '/writers/daniel-reed', path: '/writers/:slug' });
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Daniel Reed' })
    ).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Joy of Minimalism' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Books by Daniel Reed' })).toBeInTheDocument();
  });

  it('shows not found for an unknown writer', async () => {
    renderWithProviders(<WriterPage />, { route: '/writers/nobody', path: '/writers/:slug' });
    expect(await screen.findByText("We couldn't find this writer")).toBeInTheDocument();
  });
});

describe('Publishers', () => {
  it('lists publishers with book counts', async () => {
    renderWithProviders(<PublishersPage />);
    expect(
      await screen.findByRole('link', { name: /Rajkamal Prakashan.*2 books/s })
    ).toHaveAttribute('href', '/publishers/rajkamal-prakashan');
  });

  it('shows a publisher and only its books', async () => {
    renderWithProviders(<PublisherPage />, {
      route: '/publishers/rajkamal-prakashan',
      path: '/publishers/:slug',
    });
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Rajkamal Prakashan' })
    ).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Godaan' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Madhushala' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Joy of Minimalism' })).not.toBeInTheDocument();
  });

  it('shows not found for an unknown publisher', async () => {
    renderWithProviders(<PublisherPage />, {
      route: '/publishers/nope',
      path: '/publishers/:slug',
    });
    expect(await screen.findByText("We couldn't find this publisher")).toBeInTheDocument();
  });
});
