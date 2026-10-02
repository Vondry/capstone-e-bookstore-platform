import { Bookmark, BookmarkFilled, ShoppingCart } from '@carbon/icons-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/toastContext';
import { useAddToCart } from '../../cart/hooks/useCart';
import type { Book } from '../../catalog/types';
import { useWishlistItem } from '../../wishlist/hooks/useWishlist';

export type ProductActionsProps = {
  book: Book;
};

export function ProductActions({ book }: Readonly<ProductActionsProps>) {
  const { showToast } = useToast();
  const addToCart = useAddToCart();
  const { isWishlisted, toggle } = useWishlistItem(book.handle);

  const handleAddToCart = () => {
    addToCart.mutate(
      { variantId: book.variantId, quantity: 1 },
      {
        onSuccess: () => {
          showToast(`“${book.title}” added to your cart`, 'success');
        },
        onError: () => {
          showToast(`Could not add “${book.title}” to your cart. Please try again.`, 'error');
        },
      }
    );
  };

  const handleWishlist = () => {
    // SIMULATED: local wishlist (see features/wishlist/lib/wishlist.ts)
    const added = toggle();
    showToast(
      added
        ? `“${book.title}” saved to your wishlist`
        : `“${book.title}” removed from your wishlist`,
      'success'
    );
  };

  return (
    <div className="flex flex-col gap-16 md:flex-row">
      <Button
        className="md:w-[192px]"
        icon={<ShoppingCart size={20} />}
        loading={addToCart.isPending}
        onClick={handleAddToCart}
      >
        Add to Cart
      </Button>
      <Button
        variant="secondary"
        className="md:w-[192px]"
        icon={isWishlisted ? <BookmarkFilled size={20} /> : <Bookmark size={20} />}
        aria-pressed={isWishlisted}
        onClick={handleWishlist}
      >
        Add to Wishlist
      </Button>
    </div>
  );
}
