import { create } from "zustand";
import { errorHandler } from "../lib/utils";
import { requestApi } from "@/services/authService";
import { User } from "../types/User";
import { FormValues } from "../components/UsersTab";

interface RequestBody {
  user_id?: string;
  allowed_tenants: string | string[];
  default_tenant_id: string;
  username: string;
  emailid: string;
  role: string;
}

interface UserStore {
  users: User[];
  usersLoading: boolean;
  setUsersLoading: (loading: boolean) => void;
  filter: object;
  setFilter: (filter: object) => void;
  loadUsers: (filter: object) => Promise<void>;
  resetPagination: () => void;
  createEditUsers: (payload: FormValues, id: string | null) => Promise<boolean>;


  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  setCurrentPage: (page: number) => void;
  // nextPage: ()=>void;
  // prevPage: ()=>void;

  passwordLoading: boolean;
  changePassword: (
    payload: Record<string, string>,
    mode: boolean
  ) => Promise<void>;
  password: null | string;
}

export const useUserStore = create<UserStore>(
  (set, get) => ({
    users: [],
    usersLoading: false,
    filter: {},
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10,

    passwordLoading: false,
    password: "",

    setUsersLoading: (usersLoading: boolean) => set({ usersLoading }),
    setFilter: (filter: object) => set({ filter }),
    setCurrentPage: (page: number) => {
      set({ currentPage: page });
      const { filter } = get();
      get().loadUsers(filter);
    },
    resetPagination: () => set({ currentPage: 1 }),

    setPasswordLoading: (passwordLoading: boolean) => set({ passwordLoading }),

    loadUsers: async (filter: object) => {
      const { currentPage, pageSize } = get();
      set({ filter });
      try {
        set({ usersLoading: true });
        const requestBody = {
          ...filter,
          page: {
            size: pageSize,
            page_number: currentPage,
          },
          sort: "dsc",
        };
        const response = await requestApi(
          "POST",
          "users/filter/",
          requestBody,
          "accountService"
        );
        const result = response.data.data;
        set({
          users: result.users || [],
          totalItems: result.total ?? 0,
          totalPages: Math.ceil((result.total ?? 0) / pageSize),
          pageSize,
        });
      } catch (error) {
        errorHandler(error);
      } finally {
        set({ usersLoading: false });
      }
    },

    createEditUsers: async (payload, id) => {
      console.log(payload);
      try {
        set({ usersLoading: true });
        const requestBody: RequestBody = {
          allowed_tenants: "*",
          default_tenant_id: localStorage.getItem("tenant_id") ?? "",
          emailid: payload.emailid,
          role: payload.role,
          username: payload.username,
        };
        if (payload.role !== "Super Admin") {
          requestBody.allowed_tenants = payload.default_tenant_id;
          requestBody.default_tenant_id = payload.default_tenant_id[0];
        }

        if (id) {
          requestBody.user_id = id;
          if (payload.role === "Super Admin") {
            requestBody.default_tenant_id = null;
          }
        }
        console.log(requestBody);
        // if (id) {
        //   const response = await requestApi(
        //     "PATCH",
        //     "users/",
        //     requestBody,
        //     "accountService"
        //   );
        //   if (response.data.status !== "success") {
        //     throw new Error(response.data.message);
        //   }
        //   toast({
        //     variant: "success",
        //     title: "Success",
        //     description: "User Updated Successfullly",
        //   });
        // } else {
        //   const response = await requestApi(
        //     "POST",
        //     "users/",
        //     requestBody,
        //     "accountService"
        //   );
        //   if (response.data.status !== "success") {
        //     throw new Error(response.data.message);
        //   }
        //   toast({
        //     variant: "success",
        //     title: "Success",
        //     description: "User Created Successfullly",
        //   });
        // }
        // await get().loadUsers();
        // return true;
      } catch (error) {
        errorHandler(error);
        return false;
      } finally {
        set({ usersLoading: false });
      }
    },

    changePassword: async (payload, mode = false) => {
      try {
        set({ passwordLoading: true });
        const response = await requestApi(
          "POST",
          "update/user/password/",
          payload,
          "accountService"
        );
        if (mode) {
          set({
            password: response.data.data.password,
          });
        } else {
          set({
            password: null,
          });
        }
      } catch (error) {
        errorHandler(error);
      } finally {
        set({ passwordLoading: false });
      }
    },

    // nextPage: (page: number)=>{
    //   const {currentPage, totalPages, totalItems, pageSize} = get();

    //   if(page && page < totalPages){
    //     get().loadUsers
    //   }
    // }
  })
);
