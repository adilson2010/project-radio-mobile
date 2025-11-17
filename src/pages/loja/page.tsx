import { useState, useEffect } from 'react';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category: string;
  description: string;
  sizes?: string[];
  in_stock: boolean;
}

interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
}

export default function Loja() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [cart, setCart] = useState<{[key: string]: CartItem}>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const categories = [
    { id: 'todos', name: 'Todos os Produtos' },
    { id: 'camisetas', name: 'Camisetas' },
    { id: 'bermudas', name: 'Bermudas' },
    { id: 'bones', name: 'Bonés' },
    { id: 'vinis', name: 'Discos de Vinil' },
    { id: 'acessorios', name: 'Acessórios' }
  ];

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/get-products?category=${selectedCategory}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Erro ao carregar produtos');
      }
      
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product, size?: string, quantity: number = 1) => {
    const cartKey = size ? `${product.id}-${size}` : product.id;
    
    setCart(prev => ({
      ...prev,
      [cartKey]: {
        product,
        quantity: (prev[cartKey]?.quantity || 0) + quantity,
        selectedSize: size
      }
    }));

    // Feedback visual
    const button = document.querySelector(`[data-product-id="${product.id}"]`);
    if (button) {
      button.classList.add('animate-pulse');
      setTimeout(() => button.classList.remove('animate-pulse'), 500);
    }
  };

  const removeFromCart = (cartKey: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[cartKey].quantity > 1) {
        newCart[cartKey].quantity--;
      } else {
        delete newCart[cartKey];
      }
      return newCart;
    });
  };

  const updateCartQuantity = (cartKey: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(cartKey);
      return;
    }

    setCart(prev => ({
      ...prev,
      [cartKey]: {
        ...prev[cartKey],
        quantity: newQuantity
      }
    }));
  };

  const getCartTotal = () => {
    return Object.values(cart).reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  const getCartItemsCount = () => {
    return Object.values(cart).reduce((total, item) => total + item.quantity, 0);
  };

  const handleQuickAdd = (product: Product) => {
    if (product.sizes && product.sizes.length > 0) {
      setSelectedProduct(product);
      setSelectedSize('');
      setSelectedQuantity(1);
    } else {
      addToCart(product, undefined, 1);
    }
  };

  const handleAddToCartFromModal = () => {
    if (selectedProduct) {
      if (selectedProduct.sizes && selectedProduct.sizes.length > 0 && !selectedSize) {
        alert('Por favor, selecione um tamanho');
        return;
      }
      
      addToCart(selectedProduct, selectedSize, selectedQuantity);
      setSelectedProduct(null);
      setSelectedSize('');
      setSelectedQuantity(1);
    }
  };

  const handleCheckout = async () => {
    try {
      setCheckoutLoading(true);
      
      const items = Object.entries(cart).map(([_, item]) => ({
        id: item.product.id,
        quantity: item.quantity,
        size: item.selectedSize
      }));

      const response = await fetch(`${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar checkout');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Erro no checkout:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Verificar se houve sucesso ou cancelamento no pagamento
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success')) {
      setCart({});
      alert('Pagamento realizado com sucesso! Obrigado pela compra!');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.get('canceled')) {
      alert('Pagamento cancelado. Seus itens ainda estão no carrinho.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section com navegação rápida */}
      <section className="bg-gradient-to-r from-green-800 via-yellow-600 to-red-600 py-12 sticky top-16 z-40 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Botão Voltar Destacado */}
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-full font-bold transition-all cursor-pointer shadow-lg hover:shadow-xl whitespace-nowrap"
            >
              <i className="ri-home-line text-xl"></i>
              <span>Voltar ao Início</span>
            </button>

            {/* Título Central */}
            <div className="text-center flex-1 mx-4">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                🛍️ Loja Ras Reggae
              </h1>
              <p className="text-white/90 text-sm md:text-base">
                Produtos oficiais com a vibe reggae autêntica
              </p>
            </div>

            {/* Carrinho Rápido */}
            {getCartItemsCount() > 0 && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-3 bg-white text-green-700 px-6 py-3 rounded-full font-bold hover:bg-yellow-100 transition-all cursor-pointer shadow-lg hover:shadow-xl whitespace-nowrap relative"
              >
                <i className="ri-shopping-cart-line text-xl"></i>
                <span className="hidden md:inline">Carrinho</span>
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse">
                  {getCartItemsCount()}
                </span>
              </button>
            )}
          </div>

          {/* Badges de Confiança */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-white/90 text-sm">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <i className="ri-shield-check-line text-green-300"></i>
              <span>Pagamento Seguro</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <i className="ri-truck-line text-yellow-300"></i>
              <span>Frete Grátis acima de R$ 150</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <i className="ri-arrow-go-back-line text-red-300"></i>
              <span>Troca em até 30 dias</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <i className="ri-customer-service-line text-orange-300"></i>
              <span>Suporte 24h</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Filter - Melhorado */}
      <section className="py-6 bg-white shadow-md sticky top-[180px] md:top-[156px] z-30">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <span className="text-gray-600 font-medium whitespace-nowrap hidden md:inline">Categorias:</span>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-5 py-2.5 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-700'
                }`}
              >
                {category.id === 'todos' && <i className="ri-apps-line"></i>}
                {category.id === 'camisetas' && <i className="ri-t-shirt-line"></i>}
                {category.id === 'bermudas' && <i className="ri-shorts-line"></i>}
                {category.id === 'bones' && <i className="ri-cap-line"></i>}
                {category.id === 'vinis' && <i className="ri-disc-line"></i>}
                {category.id === 'acessorios' && <i className="ri-shopping-bag-line"></i>}
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid - Melhorado */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent mb-4"></div>
              <p className="text-gray-600 font-medium">Carregando produtos incríveis...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-lg max-w-md mx-auto">
              <i className="ri-shopping-bag-line text-6xl text-gray-400 mb-4"></i>
              <h3 className="text-2xl font-bold text-gray-700 mb-3">Nenhum produto encontrado</h3>
              <p className="text-gray-500 mb-6 px-6">
                {selectedCategory === 'todos' 
                  ? 'Estamos preparando produtos incríveis para você!' 
                  : `Não há produtos na categoria "${categories.find(c => c.id === selectedCategory)?.name}" no momento.`
                }
              </p>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-full font-bold hover:from-green-700 hover:to-green-800 transition-all cursor-pointer shadow-lg"
              >
                <i className="ri-home-line"></i>
                Voltar ao Início
              </button>
            </div>
          ) : (
            <>
              {/* Contador de Produtos */}
              <div className="flex items-center justify-between mb-8">
                <p className="text-gray-600 font-medium">
                  <span className="text-green-600 font-bold text-lg">{products.length}</span> {products.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <i className="ri-fire-line text-red-500"></i>
                  <span>Produtos em destaque</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-product-shop>
                {products.map(product => (
                  <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 group border border-gray-100">
                    <div className="relative overflow-hidden">
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-72 object-cover object-top group-hover:scale-110 transition-transform duration-500"
                      />
                      
                      {/* Badge de Status */}
                      {!product.in_stock ? (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                          <span className="text-white font-bold bg-red-600 px-6 py-3 rounded-lg shadow-lg text-lg">
                            <i className="ri-close-circle-line mr-2"></i>
                            Esgotado
                          </span>
                        </div>
                      ) : (
                        <div className="absolute top-4 left-4">
                          <span className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                            <i className="ri-check-line mr-1"></i>
                            Disponível
                          </span>
                        </div>
                      )}
                      
                      {/* Botão Ver Detalhes */}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="bg-white hover:bg-yellow-100 text-gray-700 p-3 rounded-full shadow-lg transition-all cursor-pointer hover:scale-110"
                          title="Ver detalhes"
                        >
                          <i className="ri-eye-line text-xl"></i>
                        </button>
                      </div>

                      {/* Badge de Categoria */}
                      <div className="absolute bottom-4 left-4">
                        <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full">
                          {categories.find(c => c.id === product.category)?.name || product.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 min-h-[56px]">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[40px]">{product.description}</p>
                      
                      {product.sizes && product.sizes.length > 0 && (
                        <div className="mb-4">
                          <span className="text-xs text-gray-500 font-medium block mb-2">
                            <i className="ri-ruler-line mr-1"></i>
                            Tamanhos:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {product.sizes.slice(0, 5).map(size => (
                              <span key={size} className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md">
                                {size}
                              </span>
                            ))}
                            {product.sizes.length > 5 && (
                              <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md">
                                +{product.sizes.length - 5}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div>
                          <span className="text-xs text-gray-500 block mb-1">Preço</span>
                          <span className="text-2xl font-bold text-green-600">
                            R$ {product.price.toFixed(2)}
                          </span>
                        </div>
                        <button
                          onClick={() => handleQuickAdd(product)}
                          disabled={!product.in_stock}
                          data-product-id={product.id}
                          className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:from-gray-300 disabled:to-gray-400 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 font-bold shadow-md hover:shadow-lg disabled:cursor-not-allowed"
                        >
                          <i className="ri-shopping-cart-line text-lg"></i>
                          {product.sizes && product.sizes.length > 0 ? 'Escolher' : 'Comprar'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Floating Cart Button - Melhorado */}
      {getCartItemsCount() > 0 && (
        <div className="fixed bottom-24 md:bottom-8 right-8 z-40 flex flex-col gap-3">
          <button
            onClick={() => setIsCartOpen(true)}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-full shadow-2xl hover:from-green-700 hover:to-green-800 transition-all cursor-pointer group relative"
          >
            <i className="ri-shopping-cart-line text-2xl"></i>
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-7 h-7 flex items-center justify-center font-bold shadow-lg animate-pulse">
              {getCartItemsCount()}
            </span>
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Ver Carrinho
            </span>
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="bg-white text-green-700 p-4 rounded-full shadow-2xl hover:bg-yellow-100 transition-all cursor-pointer group relative"
          >
            <i className="ri-home-line text-2xl"></i>
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Voltar ao Início
            </span>
          </button>
        </div>
      )}

      {/* Cart Modal - Melhorado */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl animate-slideUp">
            <div className="p-6 border-b bg-gradient-to-r from-green-600 to-green-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <i className="ri-shopping-cart-line text-2xl text-white"></i>
                  <div>
                    <h3 className="text-xl font-bold text-white">Seu Carrinho</h3>
                    <p className="text-white/80 text-sm">{getCartItemsCount()} {getCartItemsCount() === 1 ? 'item' : 'itens'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors cursor-pointer"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-280px)]">
              {Object.entries(cart).length === 0 ? (
                <div className="text-center py-12">
                  <i className="ri-shopping-cart-line text-6xl text-gray-300 mb-4"></i>
                  <p className="text-gray-600 font-medium mb-6">Seu carrinho está vazio</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-full font-bold hover:from-green-700 hover:to-green-800 transition-all cursor-pointer shadow-lg"
                  >
                    Continuar Comprando
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(cart).map(([cartKey, item]) => (
                    <div key={cartKey} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <img 
                        src={item.product.image_url} 
                        alt={item.product.name}
                        className="w-20 h-20 object-cover object-top rounded-lg shadow-md"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-800 truncate mb-1">{item.product.name}</h4>
                        {item.selectedSize && (
                          <p className="text-sm text-gray-600 mb-1">
                            <i className="ri-ruler-line mr-1"></i>
                            Tamanho: <span className="font-medium">{item.selectedSize}</span>
                          </p>
                        )}
                        <p className="text-green-600 font-bold text-lg">R$ {item.product.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateCartQuantity(cartKey, item.quantity - 1)}
                          className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 cursor-pointer transition-colors"
                        >
                          <i className="ri-subtract-line"></i>
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={item.quantity}
                          onChange={(e) => updateCartQuantity(cartKey, parseInt(e.target.value) || 1)}
                          className="w-12 text-center border border-gray-300 rounded text-sm py-1"
                        />
                        <button
                          onClick={() => updateCartQuantity(cartKey, item.quantity + 1)}
                          className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 cursor-pointer transition-colors"
                        >
                          <i className="ri-add-line"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {Object.entries(cart).length > 0 && (
              <div className="p-6 border-t bg-gradient-to-br from-gray-50 to-white">
                {/* Resumo do Pedido */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span className="font-medium">R$ {getCartTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Frete:</span>
                    <span className="font-medium text-green-600">
                      {getCartTotal() >= 150 ? 'Grátis' : 'Calculado no checkout'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <span className="text-lg font-bold text-gray-800">Total:</span>
                    <span className="text-3xl font-bold text-green-600">
                      R$ {getCartTotal().toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Botão de Checkout */}
                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading || Object.keys(cart).length === 0}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                >
                  {checkoutLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
                      Processando...
                    </>
                  ) : (
                    <>
                      <i className="ri-secure-payment-line text-xl"></i>
                      Finalizar Compra Segura
                    </>
                  )}
                </button>

                {/* Badges de Segurança */}
                <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <i className="ri-lock-line text-green-600"></i>
                    <span>Pagamento Seguro</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <i className="ri-shield-check-line text-green-600"></i>
                    <span>Dados Protegidos</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product Detail Modal - Melhorado */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-slideUp">
            <div className="p-6 border-b bg-gradient-to-r from-green-600 to-green-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <i className="ri-information-line text-2xl text-white"></i>
                  <h3 className="text-xl font-bold text-white">Detalhes do Produto</h3>
                </div>
                <button
                  onClick={() => {
                    setSelectedProduct(null);
                    setSelectedSize('');
                    setSelectedQuantity(1);
                  }}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors cursor-pointer"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <img 
                    src={selectedProduct.image_url} 
                    alt={selectedProduct.name}
                    className="w-full h-80 object-cover object-top rounded-xl shadow-lg"
                  />
                  
                  {/* Badges do Produto */}
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.in_stock ? (
                      <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium">
                        <i className="ri-check-line mr-1"></i>
                        Em Estoque
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-sm font-medium">
                        <i className="ri-close-line mr-1"></i>
                        Esgotado
                      </span>
                    )}
                    <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium">
                      <i className="ri-truck-line mr-1"></i>
                      Entrega Rápida
                    </span>
                    <span className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-sm font-medium">
                      <i className="ri-arrow-go-back-line mr-1"></i>
                      Troca Grátis
                    </span>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">{selectedProduct.name}</h2>
                    <p className="text-gray-600 leading-relaxed">{selectedProduct.description}</p>
                  </div>
                  
                  {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                    <div>
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <i className="ri-ruler-line text-green-600"></i>
                        Escolha o Tamanho:
                      </h4>
                      <div className="grid grid-cols-4 gap-2">
                        {selectedProduct.sizes.map(size => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`px-4 py-3 rounded-lg font-bold transition-all cursor-pointer ${
                              selectedSize === size
                                ? 'bg-green-600 text-white shadow-lg scale-105'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <i className="ri-add-box-line text-green-600"></i>
                      Quantidade:
                    </h4>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                        className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-red-100 hover:text-red-600 cursor-pointer transition-all font-bold text-lg"
                      >
                        <i className="ri-subtract-line"></i>
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={selectedQuantity}
                        onChange={(e) => setSelectedQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-24 text-center border-2 border-gray-300 rounded-lg py-3 font-bold text-lg focus:border-green-600 focus:outline-none"
                      />
                      <button
                        onClick={() => setSelectedQuantity(selectedQuantity + 1)}
                        className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-green-100 hover:text-green-600 cursor-pointer transition-all font-bold text-lg"
                      >
                        <i className="ri-add-line"></i>
                      </button>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Preço unitário:</span>
                      <span className="text-xl font-bold text-gray-800">
                        R$ {selectedProduct.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-800">Total:</span>
                      <span className="text-3xl font-bold text-green-600">
                        R$ {(selectedProduct.price * selectedQuantity).toFixed(2)}
                      </span>
                    </div>
                    
                    <button
                      onClick={handleAddToCartFromModal}
                      disabled={!selectedProduct.in_stock}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-800 disabled:from-gray-300 disabled:to-gray-400 transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                    >
                      <i className="ri-shopping-cart-line text-xl"></i>
                      {selectedProduct.in_stock ? 'Adicionar ao Carrinho' : 'Produto Esgotado'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}