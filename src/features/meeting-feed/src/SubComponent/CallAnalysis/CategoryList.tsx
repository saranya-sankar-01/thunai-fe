import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchCategory } from "../../features/CallAnalysiSlice";
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import { getLocalStorageItem ,requestApi } from "../../Service/MeetingService";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const url = new URL(window.location.href);
// const tenant_id = url.searchParams.get("tenant_id") || localStorage.getItem("tenant_id");
 const userInfo = getLocalStorageItem("user_info") || {};
  const tenant_id = userInfo?.default_tenant_id || url.searchParams.get("tenant_id") || localStorage.getItem("tenant_id");

import DeleteImg from "../../assets/svg/Delete.svg";
import EditImg from "../../assets/svg/Edit.svg";
import MoreVert from "../../assets/svg/More_vert.svg";
import BackArrow from "../../assets/svg/Arrow_back.svg";
import Add from "../../assets/svg/Add2.svg";
import Add2 from "../../assets/svg/Add.svg";

interface SubCategory {
  name: string;
  instruction: string;
  sub_categories: SubCategory[];
}

interface Category {
  category: string;
  instruction: string;
  sub_categories: SubCategory[];
}

const CategoryList = () => {
  const navigate = useNavigate();
  const handleBack = () => navigate(-1);
  const dispatch = useAppDispatch();

  const [setName, setSetName] = useState("");

  const [showUpdates, setShowUpdates] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSetName, setEditingSetName] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [formErrors, setFormErrors] = useState<any>({});

  const categoryState = useAppSelector((state: any) => state.category);
  const { categoryList } = categoryState;

  useEffect(() => {
    dispatch(fetchCategory());
  }, [dispatch]);

  const handleAddCategory = () => {
    setCategories([
      ...categories,
      { category: "", instruction: "", sub_categories: [] },
    ]);
  };

  const handleRemoveCategory = (index: number) => {
    if (categories.length === 1) return;
    const updated = [...categories];
    updated.splice(index, 1);
    setCategories(updated);
  };

  const handleCategoryChange = (
    index: number,
    field: keyof Category,
    value: string
  ) => {
    const updated = [...categories];

    if (field !== "sub_categories") {
      updated[index][field] = value as Category[typeof field];
    }
    setCategories(updated);
  };

  const handleAddSubCategory = (catIndex: number) => {
    const updated = [...categories];
    updated[catIndex].sub_categories.push({
      name: "",
      instruction: "",
      sub_categories: [],
    });
    setCategories(updated);
  };
  const handleAddSubSubCategory = (catIndex: number, subIndex: number) => {
    const updated = [...categories];

    updated[catIndex].sub_categories[subIndex].sub_categories.push({
      name: "",
      instruction: "",
      sub_categories: [],
    });

    setCategories(updated);
  };

  const handleRemoveSubCategory = (catIndex: number, subIndex: number) => {
    const updated = [...categories];
    updated[catIndex].sub_categories.splice(subIndex, 1);
    setCategories(updated);
  };

  const handleSubCategoryChange = (
    catIndex: number,
    subIndex: number,
    field: keyof Omit<SubCategory, "sub_categories">,
    value: string
  ) => {
    const updated = [...categories];
    updated[catIndex].sub_categories[subIndex] = {
      ...updated[catIndex].sub_categories[subIndex],
      [field]: value,
    };
    setCategories(updated);
  };

  const handleSaveCategories = async () => {

  const errors: any = {};

  categories.forEach((cat, catIndex) => {
    cat.sub_categories.forEach((sub, subIndex) => {
      sub.sub_categories.forEach((subSub, subSubIndex) => {
        if (!subSub.instruction || !subSub.instruction.trim()) {
          errors[`${catIndex}-${subIndex}-${subSubIndex}`] =
            "Instruction is required for sub-subcategory.";
        }
      }
    );
    });
  });

  if (Object.keys(errors).length > 0) {
    setFormErrors(errors);
    toast.error("Please fix the errors in the form before saving.");
    return;
  }

  setFormErrors({});

    const payload = {
      set_name: setName,
      enable: true,
      categories: categories.map((cat) => ({
        category: cat.category,
        instruction: [cat.instruction],
        sub_categories: cat.sub_categories.map((sub) => ({
          name: sub.name,
          instruction: [sub.instruction],
          sub_categories: sub.sub_categories || [],
        })),
      })),
    };

    try {
      setLoading(true);

      if (isEditing && editingSetName) {
        const response = await requestApi(
          "PATCH",
          `${tenant_id}/category/`,
          {
            ...payload,
            old_name: editingSetName,
            new_name: setName,
          },
          "authService"
        );
        toast.success(
          response?.message || "Category group updated successfully!"
        );
      } else {
        const response = await requestApi(
          "POST",
          `${tenant_id}/category/`,
          payload,
          "authService"
        );
        toast.success(
          response?.message || "Category group created successfully!"
        );
      }

      resetForm();
      dispatch(fetchCategory());
    } catch (error) {
      console.error("Error saving categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSetName("");
    setCategories([{ category: "", instruction: "", sub_categories: [] }]);
    setIsEditing(false);
    setEditingSetName("");
    setShowUpdates(null);
  };

  const handleEdit = (item: any) => {
    setSetName(item.set_name);
    setEditingSetName(item.set_name);

    setCategories(
      item.categories?.map((cat: any) => ({
        category: cat.category || "",
        instruction: cat.instruction?.[0] || "",
        sub_categories:
          cat.sub_categories?.map((sub: any) => ({
            name: sub.name || "",
            instruction: sub.instruction?.[0] || "",
            sub_categories: sub.sub_categories || [],
          })) || [],
      })) || [{ category: "", instruction: "", sub_categories: [] }]
    );

    setIsEditing(true);
    setShowUpdates(null);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (item: any) => {
    // if (
    //   !window.confirm(`Are you sure you want to delete "${item.set_name}"?`)
    // ) {
    //   return;
    // }

    try {
      setLoading(true);
      const response = await requestApi(
        "DELETE",
        `${tenant_id}/category/`,
        { set_name: item.set_name },
        "authService"
      );
      toast.success(
        response?.message || "Category group deleted successfully!"
      );
      dispatch(fetchCategory());
      setShowUpdates(null);

      if (isEditing && editingSetName === item.set_name) {
        resetForm();
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (item: any) => {
    const newEnable = !item.enable;
    try {
      setLoading(true);
      const payload = {
        enable: newEnable,
        new_name: item.set_name,
        categories: item.categories,
        old_name: item.set_name,
      };
      const response = await requestApi(
        "PATCH",
        `${tenant_id}/category/`,
        payload,
        "authService"
      );
      dispatch(fetchCategory());
      toast.success(response?.message || "Category set updated successfully");
    } catch (error) {
      console.error("Error toggling enable state:", error);
      toast.error("Category set update failed");
    } finally {
      setLoading(false);
    }
  };
  const handleRemoveSubSubCategory = (
    catIndex: number,
    subIndex: number,
    subSubIndex: number
  ) => {
    const updated = [...categories];

    updated[catIndex].sub_categories[subIndex].sub_categories.splice(
      subSubIndex,
      1
    );

    setCategories(updated);
  };

  const handleCancel = () => {
    resetForm();
  };

  const updateSubSubCategory = (
  catIndex: number,
  subIndex: number,
  subSubIndex: number,
  field: "name" | "instruction",
  value: string
) => {
  setCategories((prev) =>
    prev.map((cat, cIdx) =>
      cIdx !== catIndex
        ? cat
        : {
            ...cat,
            sub_categories: cat.sub_categories.map((sub, sIdx) =>
              sIdx !== subIndex
                ? sub
                : {
                    ...sub,
                    sub_categories: sub.sub_categories.map((ss, ssIdx) =>
                      ssIdx !== subSubIndex
                        ? ss
                        : { ...ss, [field]: value }
                    ),
                  }
            ),
          }
    )
  );
};


  return (
    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg h-[100vh]">
      <div className="flex justify-end items-center mb-2">
        <div
          className="px-4 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-800 flex items-center gap-2 cursor-pointer transition-all"
          onClick={handleBack}
        >
          <img src={BackArrow} alt="Back" className="w-5 " />
          <span className="text-gray-700">Back</span>
        </div>
      </div>

      <div className="border border-gray-200 bg-white rounded-xl px-6 py-3 mb-6 ">
        <h5 className="font-bold text-gray-800 text-lg mb-2">
          Categories ({categoryList?.data?.length || 0})
        </h5>
        <p className="text-sm text-gray-600 leading-relaxed">
          Organize your scoring structure by creating categories and nested
          subcategories.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 mb-6">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
          <h1 className="text-lg font-bold text-gray-800">
            {isEditing ? "Edit Category Group" : "Create Category Group"}
          </h1>
          {isEditing && (
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              Editing: {editingSetName}
            </span>
          )}
        </div>

        <div className="overflow-y-auto">
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category Group Name *
            </label>
            <input
              type="text"
              placeholder="Enter Category Group Name"
              value={setName}
              onChange={(e) => setSetName(e.target.value)}
              className="outline-none border border-gray-300 rounded-xl p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
              required
            />
          </div>

          <div className="space-y-6">
            {categories.map((cat, catIndex) => (
              <div
                key={catIndex}
                className="border-2 border-gray-100 rounded-xl p-6 bg-gradient-to-br from-white to-gray-50 relative transition-all duration-300 hover:shadow-lg hover:border-gray-200"
              >
                {categories.length > 1 && (
                  <button
                    onClick={() => handleRemoveCategory(catIndex)}
                    className="absolute top-4 right-4 text-red-500 text-sm font-semibold flex items-center gap-1 hover:text-red-600 transition-colors duration-200 bg-red-50 hover:bg-red-100 py-1 px-3 rounded-lg"
                  >
                    <img src={DeleteImg} alt="Remove" className="w-4 h-4" />
                    Remove
                  </button>
                )}

                <div className="mb-4">
                  <label className="block font-semibold text-gray-700 mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Category"
                    value={cat.category}
                    onChange={(e) =>
                      handleCategoryChange(catIndex, "category", e.target.value)
                    }
                    className="outline-none border border-gray-300 rounded-xl p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block font-semibold text-gray-700 mb-2">
                    Instruction (Optional)
                  </label>
                  <textarea
                    placeholder="Enter Instruction"
                    value={cat.instruction}
                    onChange={(e) =>
                      handleCategoryChange(
                        catIndex,
                        "instruction",
                        e.target.value
                      )
                    }
                    className="outline-none border border-gray-300 rounded-xl p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-vertical min-h-[80px]"
                    rows={3}
                  />
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h6 className="font-semibold text-gray-700 text-lg">
                      Subcategories
                    </h6>
                    <button
                      onClick={() => handleAddSubCategory(catIndex)}
                      className="text-blue-600 text-sm font-semibold border-2 border-gray-300 flex items-center gap-2 hover:text-blue-700 transition-colors duration-200 bg-blue-50 hover:bg-blue-100 py-2 px-4 rounded-lg"
                    >
                      <img src={Add2} alt="Add" className="w-5 h-5" />
                      Add Subcategory
                    </button>
                  </div>

                  <div className="space-y-4">
                    {cat.sub_categories.map((sub, subIndex) => (
                      <div
                        key={subIndex}
                        className="border-2 border-gray-100 rounded-xl p-4 bg-white relative transition-all duration-200 hover:shadow-md hover:border-gray-200"
                      >
                        <button
                          onClick={() =>
                            handleRemoveSubCategory(catIndex, subIndex)
                          }
                          className="absolute top-3 right-3 text-red-400 text-sm flex items-center gap-2 font-semibold hover:text-red-600 transition-colors duration-200"
                        >
                          <img
                            src={DeleteImg}
                            alt="Remove"
                            className="w-4 h-4"
                          />
                          Remove
                        </button>

                        <div className="mb-4">
                          <label className="block font-semibold text-gray-700 mb-2">
                            Subcategory Name *
                          </label>
                          <input
                            type="text"
                            placeholder="Enter Subcategory Name"
                            value={sub.name}
                            onChange={(e) =>
                              handleSubCategoryChange(
                                catIndex,
                                subIndex,
                                "name",
                                e.target.value
                              )
                            }
                            className="outline-none border border-gray-300 rounded-xl p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            required
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-gray-700 mb-2">
                            Instruction (Optional)
                          </label>
                          <textarea
                            placeholder="Enter Instruction"
                            value={sub.instruction}
                            onChange={(e) =>
                              handleSubCategoryChange(
                                catIndex,
                                subIndex,
                                "instruction",
                                e.target.value
                              )
                            }
                            className="outline-none border border-gray-300 rounded-xl p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-vertical min-h-[80px]"
                            rows={3}
                          />
                        </div>
                        {/* ADD SUB-SUB CATEGORY BUTTON */}
                        <button
                          onClick={() =>
                            handleAddSubSubCategory(catIndex, subIndex)
                          }
                          className="mt-3 mb-2 text-sm text-blue-600 flex items-center gap-1"
                        >
                          <img src={Add2} className="w-4 h-4" />
                          Add Sub-Sub Category
                        </button>

                        {sub.sub_categories.map((subSub, subSubIndex) => (
                          <div
                            key={subSubIndex}
                            className="border border-gray-200 p-5 pt-8 rounded-md mb-3 bg-gray-50 relative"
                          >
                            {/* REMOVE BUTTON */}
                            <button
                              onClick={() =>
                                handleRemoveSubSubCategory(
                                  catIndex,
                                  subIndex,
                                  subSubIndex
                                )
                              }
                              className="absolute top-2 right-2 text-red-500 text-xs flex items-center gap-1"
                            >
                              <img src={DeleteImg} className="w-3 h-3" />
                              Remove
                            </button>

                            <div>
                              <label className="block font-semibold text-gray-700 mb-2">
                                Sub-subcategory Name *
                              </label>
                              <input
                                type="text"
                                placeholder="Sub-Sub Category Name"
                                value={subSub.name}
                                onChange={(e) =>
                                updateSubSubCategory(
                                  catIndex,
                                  subIndex,
                                  subSubIndex,
                                  "name",
                                  e.target.value
                                )
                              }

                                className="outline-none border border-gray-300 rounded-xl p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm mb-2"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold text-gray-700 mb-2">
                                Instruction (Mandatory)
                              </label>
                              <textarea
                                placeholder="Instruction"
                                value={subSub.instruction}
                                onChange={(e) => {
                                   updateSubSubCategory(
                                   catIndex,
                                   subIndex,
                                   subSubIndex,
                                   "instruction",
                                   e.target.value
                                 );

                                  setFormErrors((prev: any) => {
                                    const newErrors = { ...prev };
                                    delete newErrors[`${catIndex}-${subIndex}-${subSubIndex}`];
                                    return newErrors;
                                       });
                                }}

                                className="outline-none border border-gray-300 rounded-xl p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                              />
                            </div>
                            <div className="mt-1">
                              {formErrors[`${catIndex}-${subIndex}-${subSubIndex}`] && (
                                <p className="text-red-500 text-sm mt-1">
                                  {formErrors[`${catIndex}-${subIndex}-${subSubIndex}`]}
                                </p>
                              )}
                            </div>


                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            className="mt-5 flex flex-wrap items-center justify-center 
     gap-3 sm:gap-4 md:justify-between"
          >
            <p className="text-sm text-gray-600 leading-relaxed max-w-md">
              Categories help organize and classify your calls for better
              analysis and reporting.
              {isEditing &&
                " You are currently editing an existing category group."}
            </p>
            <button
              onClick={handleAddCategory}
              // className="px-2 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium flex"
              className="flex px-4 py-2 text-sm bg-primary text-white rounded-md bg-blue-600"
            >
              <img src={Add} alt="Add" className="size-6" />
              Add Category
            </button>
          </div>

          <div className="mt-8 pt-6 flex justify-end gap-4">
            <button
              disabled={loading}
              className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition text-sm sm:text-base shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed  cursor-pointer"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              disabled={loading || !setName.trim()}
              onClick={handleSaveCategories}
              className={`${
                loading
                  ? "bg-gradient-to-r from-blue-300 to-blue-400 cursor-not-allowed"
                  : "px-4 py-2 text-sm bg-primary text-white rounded-md bg-blue-600"
              } ${
                !setName.trim() ? "opacity-50 cursor-not-allowed" : ""
              } text-white rounded-xl px-3 py-2 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl `}
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin cursor-pointer" />
                  {isEditing ? "Updating..." : "Saving..."}
                </span>
              ) : isEditing ? (
                "Update Category Group"
              ) : (
                "Save Category Group"
              )}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg mt-6">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 bg-blue-50 px-6 py-4 rounded-t-2xl">
            <h3 className="text-lg font-bold text-gray-800">
              Existing Category Groups
            </h3>
            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-500 text-white text-xs font-semibold">
              {categoryList?.data?.length || 0}
            </div>
          </div>

          <div className="space-y-1">
            {categoryList?.data?.length > 0 ? (
              categoryList.data.map((item: any, index: number) => (
                <div
                  key={item.id || index}
                  className={`relative flex justify-between items-center py-2 px-6 rounded-lg transition-all duration-200 ${
                    isEditing && editingSetName === item.set_name
                      ? "bg-blue-50 border-2 border-blue-200"
                      : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span
                      className={`inline-block h-3 w-3 rounded-full ${
                        item.enable ? "bg-blue-500" : "bg-gray-400"
                      }`}
                    ></span>
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-700">
                          {item.set_name}
                        </span>
                        {isEditing && editingSetName === item.set_name && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                            Currently Editing
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-600">
                        {item?.categories?.length || 0} Categories
                      </span>
                    </div>
                  </div>

                  <div className="relative flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <button
                        onClick={() => handleToggle(item)}
                        disabled={loading}
                        className={`relative w-10 h-5 rounded-full transition-all duration-300 ease-in-out cursor-pointer
                        ${item.enable ? "bg-blue-500" : "bg-gray-300"}`}
                      >
                        <span
                          className={`absolute top-1 left-1 w-3 h-3 mr-0.5 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out
                          ${item.enable ? "translate-x-6" : ""}`}
                        ></span>
                      </button>
                    </div>

                    <div className="relative">
                      <img
                        src={MoreVert}
                        alt="more options"
                        className="w-6 h-6 cursor-pointer hover:opacity-75 transition-opacity"
                        onClick={() =>
                          setShowUpdates(showUpdates === index ? null : index)
                        }
                      />

                      {showUpdates === index && (
                        <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                          <button
                            onClick={() => handleEdit(item)}
                            className=" w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2"
                          >
                            <img src={EditImg} alt="Edit" className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className=" w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2"
                          >
                            <img
                              src={DeleteImg}
                              alt="Delete"
                              className="w-4 h-4"
                            />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No category groups found. Create your first one above!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        className="mr-20"
      />
    </div>
  );
};

export default CategoryList;
