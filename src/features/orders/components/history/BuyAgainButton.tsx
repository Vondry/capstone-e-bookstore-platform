import { ShoppingCartPlus } from '@carbon/icons-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/toastContext';
import { useAddToCart } from '@/features/cart/hooks/useCart';
import type { Book } from '@/features/catalog/types';

export type BuyAgainButtonProps = {
  book: Book;
};

/** Adds one copy of a previously ordered book to the cart (S7) */
export function BuyAgainButton({ book }: Readonly<BuyAgainButtonProps>) {
  const addToCart = useAddToCart();
  const { showToast } = useToast();

  const handleClick = () => {
    addToCart.mutate(
      { variantId: book.variantId },
      {
        onSuccess: () => {
          showToast(`Added ${book.title} to your cart`, 'success');
        },
        onError: () => {
          showToast(`Could not add ${book.title} to your cart. Please try again.`, 'error');
        },
      }
    );
  };

  return (
    <Button
      variant="secondary"
      size="small"
      loading={addToCart.isPending}
      icon={<ShoppingCartPlus size={16} />}
      onClick={handleClick}
      aria-label={`Buy ${book.title} again`}
    >
      Buy it again
    </Button>
  );
}
