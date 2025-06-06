import React, { useContext, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FaMinus, FaPlus, FaTrash } from 'react-icons/fa';
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { GlobalContext } from '../../provider/GlobalProvider';
import { convertVND } from '../../utils/ConvertVND';

const DisplayCartItem = ({ close }) => {
    const cartItems = useSelector((state) => state.cartItem?.cart) || [];
    const user = useSelector((state) => state.user)
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { updateCartItem, deleteCartItem, fetchCartItem, calculateTotal, savePrice,isCartOpen, setIsCartOpen } = useContext(GlobalContext);

    // Set cart open state when component mounts
    useEffect(() => {
        setIsCartOpen(true)
        return () => {
            setIsCartOpen(false)
        }
    }, [setIsCartOpen])

    const handleCloseCart = () => {
        setIsCartOpen(false)
        if (close) {
            close()
        }
    }

    const handleIncreaseQuantity = async (itemId) => {
        try {
            const item = cartItems.find(item => item._id === itemId);
            if (item) {
                if (item.quantity >= item.productId.stock) {
                    toast.warning(`Chỉ còn ${item.productId.stock} sản phẩm trong kho`);
                    return;
                }

                await updateCartItem(itemId, item.quantity + 1);
                await fetchCartItem();
            }
        } catch (error) {
            toast.error("Không thể tăng số lượng sản phẩm");
        }
    }

    const handleDecreaseQuantity = async (itemId) => {
        try {
            const item = cartItems.find(item => item._id === itemId);
            if (item && item.quantity > 1) {
                await updateCartItem(itemId, item.quantity - 1);
                await fetchCartItem();
            }
        } catch (error) {
            toast.error("Không thể giảm số lượng sản phẩm");
        }
    }

    const handleRemoveItem = async (itemId) => {
        try {
            await deleteCartItem(itemId);
            await fetchCartItem();
        } catch (error) {
            toast.error("Không thể xóa sản phẩm khỏi giỏ hàng");
        }
    }

    const redirectToCheckout = () => {
        if(user?._id){
            navigate("/checkout")
            if(close){
                close()
            }
            return
        }
        toast("Vui lòng đăng nhập")
    }

    return (
        <section className={`bg-neutral-900 fixed top-0 left-0 right-0 bottom-0 bg-opacity-70 z-50 transition-opacity duration-300 ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className={`bg-white mb-2 rounded-md w-full max-w-sm min-h-screen max-h-screen ml-auto flex flex-col transition-transform duration-300 ease-in-out ${
                isCartOpen ? 'translate-x-0' : 'translate-x-full'
                }`}>
                <div className='flex justify-between px-5 pt-5 pb-3 shadow-lg'>
                    <p className='font-semibold text-lg'>Giỏ hàng của bạn</p>

                    <button onClick={handleCloseCart}>
                        <IoClose size={23} className='hover:text-red-500 lg:block' />
                    </button>
                </div>

                {/* display cart item */}
                <div className='px-5 py-4 overflow-y-auto flex-grow'>
                    {cartItems && cartItems.length > 0 ? (
                        cartItems.map((item) => (
                            <div key={item._id} className='flex mb-4 border-b pb-3'>
                                <img
                                    src={item.productId.image[0]}
                                    alt={item.productId.name}
                                    className='w-16 h-16 object-contain mr-3'
                                />
                                <div className='flex-1'>
                                    <div className='flex justify-between'>
                                        <p className='font-medium line-clamp-2 pr-2'>{item.productId.name}</p>
                                        <button
                                            onClick={() => handleRemoveItem(item._id)}
                                            className='text-gray-500 hover:text-red-500'
                                        >
                                            <FaTrash size={14} />
                                        </button>
                                    </div>

                                    <div className='flex justify-between items-end mt-2'>
                                        <div>
                                            {item.productId?.discount > 0 ? (
                                                <>
                                                    <p className='text-xs text-gray-500 line-through'>
                                                        {convertVND(item.productId?.price || 0)}
                                                    </p>
                                                    <p className='text-green-600 font-medium'>
                                                        {convertVND((item.productId?.price || 0) - ((item.productId?.price || 0) * (item.productId?.discount || 0) / 100))}
                                                    </p>
                                                </>
                                            ) : (
                                                <div>
                                                <p className='text-green-600 font-medium'>
                                                    {convertVND(item.productId?.price || 0)}
                                                </p>
                                                {/* <p>{item.productId.unit}</p> */}
                                                </div>
                                                
                                            )}
                                        </div>

                                        <div className='flex items-center'>
                                            <button
                                                onClick={() => handleDecreaseQuantity(item._id)}
                                                className='w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l bg-gray-100 hover:bg-gray-200'
                                                disabled={item.quantity <= 1}
                                            >
                                                <FaMinus size={10} />
                                            </button>
                                            <div className='w-10 h-8 flex items-center justify-center border-t border-b border-gray-300 bg-white'>
                                                {item.quantity || 0}
                                            </div>
                                            <button
                                                onClick={() => handleIncreaseQuantity(item._id)}
                                                className='w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r bg-gray-100 hover:bg-gray-200'
                                                disabled={item.quantity >= (item.productId?.stock || 0)}
                                            >
                                                <FaPlus size={10} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className='flex flex-col items-center justify-center h-full'>
                            <p className='text-center text-gray-500 mb-2'>Giỏ hàng của bạn đang trống</p>
                            <p className='text-center text-sm text-gray-400'>Hãy thêm sản phẩm vào giỏ hàng</p>
                        </div>
                    )}
                </div>

                {/* display total price and payment button */}
                <div className='px-5 py-4 border-t mt-auto'>
                 
                        <div className='flex justify-between items-center mb-1'>
                            <p className='font-medium text-sm'>Tiền sản phẩm:</p>
                            <p className='font-medium text-sm'>{convertVND(calculateTotal())}</p>
                        </div>
                        <div className='flex justify-between items-center mb-2'>
                            <p className='font-medium text-sm'>Phí vận chuyển:</p>
                            <p className='font-medium text-sm'>Miễn phí</p>
                        </div>
                        <div className='flex justify-between mb-1'>
                            <p className='font-medium text-lg'>Tổng thanh toán:</p>
                            <p className='font-bold text-lg text-green-600'>{convertVND(calculateTotal())}</p>
                        </div>
                        <p className='mb-3 flex justify-end items-end font-medium text-sm text-gray-500'>{`Tiết kiệm: ${convertVND(savePrice())}`}</p>
                    <button
                        className='w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition'
                        disabled={!cartItems || cartItems.length === 0}
                        onClick={redirectToCheckout}
                    >
                        Thanh toán
                    </button>
                </div>
            </div>
        </section>
    )
}

export default DisplayCartItem
