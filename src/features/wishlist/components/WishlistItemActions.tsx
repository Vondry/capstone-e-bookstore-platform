import { Close, ShoppingCartPlus } from '@carbon/icons-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/toastContext';
import { useAddToCart } from '../../cart/hooks/useCart';
import type { Book } from '../../catalog/types';
import { removeFromWishlist } from '../lib/wishlist';

export type WishlistItemActionsProps = {
  book: Book;
};

/** "Add to Cart" and "Remove" under a wishlisted book */
export function WishlistItemActions({ book }: Readonly<WishlistItemActionsProps>) {
  const addToCart = useAddToCart();
  const { showToast } = useToast();

  const handleAdd = () => {
    addToCart.mutate(
      { variantId: book.variantId },
      {
        onSuccess: () => {
          showToast(`“${book.title}” added to your cart`);
        },
        onError: () => {
          showToast(`Couldn't add “${book.title}” to your cart`, 'error');
        },
      }
    );
  };

  const handleRemove = () => {
    removeFromWishlist(book.handle);
    showToast(`“${book.title}” removed from your wishlist`);
  };

  return (
    <div className="flex flex-wrap gap-8">
      <Button
        size="small"
        icon={<ShoppingCartPlus size={16} />}
        loading={addToCart.isPending}
        onClick={handleAdd}
        aria-label={`Add ${book.title} to cart`}
      >
        Add to Cart
      </Button>
      <Button
        size="small"
        variant="secondary"
        icon={<Close size={16} />}
        onClick={handleRemove}
        aria-label={`Remove ${book.title} from wishlist`}
      >
        Remove
      </Button>
    </div>
  );
}
