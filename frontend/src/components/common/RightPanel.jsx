import { Link } from "react-router-dom";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import { USERS_FOR_RIGHT_PANEL } from "../../utils/db/dummy";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import Usefollow from "../../hooks/usefollow";
import LoadingSpinner from "./LoadingSpinner";

const RightPanel = () => {
	const {data:SuggestedUsers,isLoading} = useQuery({
		queryKey:["SuggestedUsers"],
		queryFn:async()=>{
			try {
				const res = await fetch("api/users/suggested")
				const data = await res.json();
				if(!res.ok) throw new Error(data.error || "Something went wrong")
				return data;
			} catch (error) {
				throw new Error(error.message)
			}
		}
	});
	const {follow,isPending} = Usefollow()
	if(SuggestedUsers?.length === 0) return <div className="md:w-64 w-0"></div>
	return (
		<div className='hidden lg:block my-4 mx-2'>
			<div className='bg-[#16181C] p-4 rounded-md sticky top-2'>
				<p className='font-bold'>Who to follow</p>
				<div className='flex flex-col gap-4'>
					{/* item */}
					{isLoading && (
						<>
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
						</>
					)}
					{!isLoading &&
						SuggestedUsers?.map((user) => (
							<Link
								to={`/profile/${user.username}`}
								className='flex items-center justify-between gap-4'
								key={user._id}
							>
								<div className='flex gap-2 items-center'>
									<div className='avatar'>
										<div className='w-8 rounded-full'>
											<img src={user.profileimg || "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png"} />
										</div>
									</div>
									<div className='flex flex-col'>
										<span className='font-semibold tracking-tight truncate w-28'>
											{user.fullName}
										</span>
										<span className='text-sm text-slate-500'>@{user.username}</span>
									</div>
								</div>
								<div>
									<button
										className='btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm'
										onClick={(e) => {
											e.preventDefault()
											follow(user._id)
										}}
									>
										{isPending?<LoadingSpinner size="sm"/>:"Follow"}
									</button>
								</div>
							</Link>
						))}
				</div>
			</div>
		</div>
	);
};
export default RightPanel;