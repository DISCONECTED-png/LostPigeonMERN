import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import toast from 'react-hot-toast';

const Usefollow = () => {
    const queryclient = useQueryClient();
    const {mutate:follow,isPending} = useMutation({
        mutationFn: async (userid)=>{
            try {
                const res = await fetch(`/api/users/follow/${userid}`,{
                    method:"POST"
                })
                const data = await res.json();
                if(!res.ok) throw new Error(data.error || "Something went wrong")
                return data;
            } catch (error) {
                throw new Error(error.message)
            }
        },
        onSuccess:()=>{
            Promise.all([
                queryclient.invalidateQueries({queryKey:["SuggestedUsers"]}),
                queryclient.invalidateQueries({queryKey:["authUser"]})
            ])
        },
        onError:(error)=>{
            toast.error(error.message)
        }
    })
    return {follow,isPending}
}

export default Usefollow