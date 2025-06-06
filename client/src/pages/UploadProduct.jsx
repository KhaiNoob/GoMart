import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { CiSaveDown2 } from "react-icons/ci";
import { FaTrash } from "react-icons/fa";
import { IoMdCloudUpload } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { useSelector } from 'react-redux';
import SummaryApi from '../common/SummaryApi';
import AddField from '../components/forms/AddField';
import ViewImage from '../components/ui/ViewImage.jsx';
import Axios from '../utils/Axios';
import AxiosToastError from '../utils/AxiosToastError';
import successAlert from '../utils/SuccessAlert.js';
import UploadImage from '../utils/UploadImage';

const UploadProduct = () => {
  const [data, setData] = useState({
    name: "",
    image: [],
    brand: "",
    category: [],
    subCategory: [],
    unit: "",
    price: "",
    stock: "",
    discount: "",
    description: "",
    more_details: {},
  })

  const allCategory = useSelector(state => state.product.allCategory)
  const allSubCategory = useSelector(state => state.product.allSubCategory)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectSubCategory, setSelectSubCategory] = useState("")
  const [addField, setAddField] = useState([])
  const [openAddField, setOpenAddField] = useState(false)
  const [fieldName, setFieldName] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target

    setData((preve) => {
      return {
        ...preve,
        [name]: value,
      }
    })
  }

  const handleUploadProductImage = async (e) => {
    const files = e.target.files
    
    if (!files || files.length === 0) {
      return
    }
    
    const uploadPromises = Array.from(files).map(async (file) => {
      const response = await UploadImage(file)
      return response.data?.data?.url
    })
    
    const uploadedUrls = await Promise.all(uploadPromises)
    const validUrls = uploadedUrls.filter(url => url)
    
    setData(prev => {
      return {
        ...prev,
        image: [...prev.image, ...validUrls]
      }
    })
  }

  const [ImageUrl, setImageUrl] = useState('')

  const handleDeleteImage = async (index) => {
    data.image.splice(index, 1)
    setData((preve) => {
      return {
        ...preve,
      }
    })

  }

  const handleRemoveCategorySelecteted = async (index) => {
    data.category.splice(index, 1)
    setData((preve) => {
      return {
        ...preve
      }
    })
  }

  const handleSubCategoryChange = (e) => {
    const value = e.target.value;
    if (!value) return;
    
    const subCategory = allSubCategory.find(el => el._id === value);
    if (!subCategory) return;
    
    const isAlreadySelected = data.subCategory.includes(subCategory._id);
    if (isAlreadySelected) {
      toast.error('Danh mục con này đã được chọn!');
      return;
    }

    setData(prev => ({
      ...prev,
      subCategory: [...prev.subCategory, subCategory._id]
    }));
    setSelectSubCategory("");
  };

  const handleRemoveSubCategorySelected = (index) => {
    setData(prev => ({
      ...prev,
      subCategory: prev.subCategory.filter((_, i) => i !== index)
    }));
  };

  const handleAddField = () => {
    setData((preve) => {
      return {
        ...preve,
        more_details: {
          ...preve.more_details,
          [fieldName]: '',
        }
      }
    })
    setFieldName('')
    setOpenAddField(false)
  }

  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)
      const response = await Axios({
        ...SummaryApi.create_product,
        data: data
      })

      const { data: responseData } = response

      if(responseData.success) {
        await successAlert(responseData.message)
        setData({
          name: "",
          image: [],
          brand: "",
          category: [],
          subCategory: [],
          unit: "",
          price: "",
          stock: "",
          discount: "",
          description: "",
          more_details: {},
        })

        // close()
        // fetchData()
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredSubCategories = () => {
    if (data.category.length === 0) return [];
    
    return allSubCategory.filter(subCat => {
      return subCat.category.some(cat => 
        data.category.some(selectedCat => selectedCat._id === cat._id)
      );
    });
  };

  return (
    <section>
      <div className='font-extralight bg-white shadow-md p-2 flex justify-between '>
        <h1 className=' text-2xl items-center p-1'>Thêm sản phẩm</h1>
      </div>
      

      <div className='my-5 overflow-y-scroll max-h-[75vh] no-scrollbar'>
        <form onSubmit={handleSubmit} className='bg-white shadow-sm rounded-lg p-6 space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-3 border rounded-md'>
            {/* name */}
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>Tên sản phẩm</label>
              <input
                type="text"
                id='name'
                placeholder='Điền tên sản phẩm'
                name='name'
                value={data.name}
                onChange={handleChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>

            {/* brand */}
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>Thương hiệu</label>
              <input
                type="text"
                id='brand'
                placeholder='Điền thương hiệu'
                name='brand'
                value={data.brand}
                onChange={handleChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>

            {/* unit */}
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>Đơn vị</label>
              <input
                type="text"
                id='unit'
                placeholder='Điền đơn vị (cái, hộp, kg,...)'
                name='unit'
                value={data.unit}
                onChange={handleChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 bg-gray-50 p-3 border rounded-md'>
            {/* price */}
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>Giá bán</label>
              <div className='relative'>
                <input
                  type="number"
                  id='price'
                  placeholder='0'
                  name='price'
                  value={data.price}
                  onChange={handleChange}
                  required
                  className='w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
                <span className='absolute inset-y-0 left-2 flex items-center text-gray-500'>₫</span>
              </div>
            </div>

            {/* discount */}
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>Giảm giá</label>
              <div className='relative'>
                <input
                  type="number"
                  id='discount'
                  min="0"
                  max="100"
                  name='discount'
                  value={data.discount}
                  onChange={handleChange}
                  className='w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
                <span className='absolute inset-y-0 left-2 flex items-center text-gray-500'>%</span>
              </div>
            </div>


            {/* stock */}
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>Tồn kho</label>
              <input
                type="number"
                id='stock'
                placeholder='0'
                name='stock'
                value={data.stock}
                onChange={handleChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-3 border rounded-md' >
            {/* Category */}
            <div className='grid gap-1 bg-gray-50 p-3 border rounded-md'>
              <label className='block text-sm font-medium text-gray-700'>Danh mục</label>
              <div>
                <select
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  value={selectedCategory || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!value) return;
                    const category = allCategory.find(el => el._id === value);
                    setData((preve) => {
                      return {
                        ...preve,
                        category: [...preve.category, category]
                      }
                    });
                    setSelectedCategory("");
                  }}
                >
                  <option value={""}>Chọn danh mục</option>
                  {
                    allCategory.map((c, index) => {
                      return (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      )
                    })
                  }
                </select>

                <div className='flex flex-wrap gap-2 mt-2 min-h-[60px] max-h-[120px] overflow-y-auto p-1'>
                  {
                    data.category.map((c, index) => {
                      return (
                        <div key={c._id + index + "product_section"}
                          className='bg-green-100 shadow-md border mx-1 my-1 w-fit h-fit flex items-center'
                        >{c.name}
                          <button onClick={() => handleRemoveCategorySelecteted(index)} className='mx-1 hover:text-red-600'>
                            <IoClose size={18} />
                          </button>
                        </div>
                      )
                    })
                  }
                </div>
              </div>
            </div>

            {/* SubCategory */}
            <div className='grid gap-1 bg-gray-50 p-3 border rounded-md'>
              <label className='block text-sm font-medium text-gray-700'>Danh mục con</label>
              <div>
                <select
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  value={selectSubCategory}
                  disabled={data.category.length === 0}
                  onChange={(e) => {
                    const value = e.target.value
                    if (!value) return;
                    const subCategory = allSubCategory.find(el => el._id === value)
                    if (!subCategory) return;
                    
                    const isAlreadySelected = data.subCategory.some(sc => sc._id === subCategory._id);
                    if (isAlreadySelected) {
                      toast.error('Danh mục con này đã được chọn!');
                      return;
                    }

                    setData((preve) => {
                      return {
                        ...preve,
                        subCategory: [...preve.subCategory, subCategory]
                      }
                    })
                    setSelectSubCategory("")
                  }}
                >
                  <option value="">Chọn danh mục con</option>
                  {
                    getFilteredSubCategories().map((sc, index) => {
                      return (
                        <option key={sc._id} value={sc._id}>{sc.name}</option>
                      )
                    })
                  }
                </select>

                <div className='flex flex-wrap gap-2 mt-2 min-h-[60px] max-h-[120px] overflow-y-auto p-1'>
                  {
                    data.subCategory.map((sc, index) => {
                      if (!sc) return null;
                      return (
                        <div key={sc._id + index + "subcategory_section"}
                          className='bg-green-100 shadow-md border mx-1 my-1 w-fit h-fit flex items-center'
                        >
                          {sc.name}
                          <button onClick={() => handleRemoveSubCategorySelected(index)} className='mx-1 hover:text-red-600'>
                            <IoClose size={18} />
                          </button>
                        </div>
                      )
                    })
                  }
                </div>
              </div>
            </div>
          </div>

          {/* image */}
          <div className='grid gap-2 p-3 bg-gray-50 border rounded-md'>
            <label htmlFor='productImage' className='block text-sm font-medium text-gray-700'>Ảnh
              <div className='flex justify-center flex-col items-center border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors cursor-pointer'>
                <IoMdCloudUpload size={60} />
                <p>Tải hình ảnh lên</p>
                <input
                  type='file'
                  multiple
                  id='productImage'
                  onChange={handleUploadProductImage}
                  className='hidden'
                />
              </div>
            </label>
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-10 gap-4 mt-4'>
              {
                data.image.map((image, index) => {
                  return (
                    <div key={image + index} className='relative aspect-square rounded-lg overflow-hidden border border-gray-200'>
                      <img
                        src={image}
                        alt="category"
                        className='absolute inset-0 bg-blue-50  flex items-center justify-center'
                        onClick={() => setImageUrl(image)} />
                      <div onClick={() => handleDeleteImage(index)} className='p-2 w-fit bg-gray-50 rounded-full text-black hover:bg-red-600 transform transition-transform hover:scale-105'>
                        <FaTrash />
                      </div>
                    </div>


                  )
                })
              }
            </div>

          </div>

          {/* discription */}
          <div className='grid gap-2 bg-gray-50 p-3 border rounded-md'>
            <label className='block text-sm font-medium text-gray-700'>Mô tả sản phẩm</label>
            <textarea
              type="text"
              id='description'
              placeholder='Nhập mô tả cho sản phẩm'
              name='description'
              value={data.description}
              onChange={handleChange}
              required
              rows={5}
              className='bg-white border ouline-none text-gray-900 text-sm rounded-lg focus:bg-white focus:border-primary-light block w-full p-2.5'
            />
          </div>

          {/* more details */}
          <div>
            {
              Object?.keys(data?.more_details)?.map((key, index) => {
                return (
                  <div className='grid gap-2 p-3'>
                    <label htmlFor={key} className='block text-sm font-medium text-gray-700'>{key}</label>
                    <input
                      type="text"
                      id={key}
                      placeholder='Nhập thông tin'
                      name={key}
                      value={data?.more_details[key]}
                      onChange={(e) => {
                        const value = e.target.value
                        setData((preve) => {
                          return {
                            ...preve,
                            more_details: {
                              ...preve.more_details,
                              [key]: value
                            }
                          }
                        })
                      }}
                      required
                      className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:bg-blue-50 focus:border-primary-light block w-full p-2.5'
                    />
                  </div>
                )
              })
            }
          </div>
          <div onClick={() => setOpenAddField(true)} className='border cursor-pointer w-fit grid gap-2 p-3 ml-3 rounded-md bg-blue-500 hover:bg-blue-600 font-medium text-sm text-white  '>
            Thêm thông tin khác
          </div>


          <div className='flex justify-center items-center mt-6'>
            <div onClick={handleSubmit}
              className='flex px-8 gap-2 py-2.5 bg-blue-600 text-white rounded-md
              hover:bg-blue-700 transition-colors duration-200
              font-medium text-base cursor-pointer'>
              <CiSaveDown2 size={20} />
              Lưu
            </div>
          </div>
        </form>
      </div>
      

      {
        ImageUrl && (
          <ViewImage
            url={ImageUrl}
            close={() => setImageUrl('')}
          />
        )
      }

      {
        openAddField && (
          <AddField
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
            submit={handleAddField}
            close={() => setOpenAddField(false)} />
        )
      }



    </section>
  )
}

export default UploadProduct