import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Posts from "../../components/common/Posts";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import EditProfileModal from "./EditProfileModal";

import { POSTS } from "../../utils/db/dummy";

import { FaArrowLeft } from "react-icons/fa6";
import { IoCalendarOutline } from "react-icons/io5";
import { FaLink } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatMemberSinceDate } from "../../utils/date/date";
import Usefollow from "../../hooks/usefollow";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import toast from "react-hot-toast";

const ProfilePage = () => {
	const [coverimg, setcoverimg] = useState(null);
	const [profileimg, setprofileimg] = useState(null);
	const [feedType, setfeedType] = useState("posts");
	const {username} = useParams()
	const coverimgRef = useRef(null);
	const profileimgRef = useRef(null);
	const {follow,isPending} = Usefollow();
	const queryclient = useQueryClient();
	const {data:authUser} = useQuery({queryKey:["authUser"]})
	
	const {data:user,isLoading,refetch,isRefetching} = useQuery({
		queryKey:["userProfile"],
		queryFn:async()=>{
			try {
				const res = await fetch(`/api/users/profile/${username}`)
				const data = await res.json()
				if(!res.ok) throw new Error(data.error || "Something went wrong");
				return data;
			} catch (error) {
				throw new Error(error)
			}
		}
	})
	const {mutateAsync:updateprofile,isPending:isupdatingprofile} = useMutation({
		mutationFn:async()=>{
			try {
				const res = await fetch("/api/users/update",{
					method:"POST",
					headers:{
						"Content-Type":"application/json"
					},
					body:JSON.stringify({coverimg,profileimg})
				})
				const data = await res.json()
				if(!res.ok) throw new Error(data.error || "Something went wrong");
				return data;
			} catch (error) {
				throw new Error(error)
			}
		},
		onSuccess:()=>{
			toast.success("Profile updated successfully");
			Promise.all([
				queryclient.invalidateQueries({queryKey:["authUser"]}),
				queryclient.invalidateQueries({queryKey:["userProfile"]})
			])
		},
		onError:()=>{
			toast.error("Cant Update profile")
		}
	})
	const isMyProfile = authUser._id === user?._id;
	const membersincedate = formatMemberSinceDate(user?.createdAt)
	const amifollowing = authUser?.following.includes(user?._id)
	const handleImgChange = (e, state) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				state === "coverimg" && setcoverimg(reader.result);
				state === "profileimg" && setprofileimg(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};
	useEffect(() => {
	  refetch()
	}, [username,refetch])
	

	return (
		<>
			<div className='flex-[4_4_0]  border-r border-gray-700 min-h-screen '>
				{/* HEADER */}
				{(isLoading || isRefetching) && <ProfileHeaderSkeleton />}
				{!isLoading && !isRefetching && !user && <p className='text-center text-lg mt-4'>User not found</p>}
				<div className='flex flex-col'>
					{!isLoading && !isRefetching && user && (
						<>
							<div className='flex gap-10 px-4 py-2 items-center'>
								<Link to='/'>
									<FaArrowLeft className='w-4 h-4' />
								</Link>
								<div className='flex flex-col'>
									<p className='font-bold text-lg'>{user?.fullName}</p>
									<span className='text-sm text-slate-500'>{POSTS?.length} posts</span>
								</div>
							</div>
							{/* COVER IMG */}
							<div className='relative group/cover'>
								<img
									src={coverimg || user?.coverimg || "https://pngmagic.com/product_images/bright-orange-solid-color-background.jpg"}
									className='h-52 w-full object-cover'
									alt='cover image'
								/>
								{isMyProfile && (
									<div
										className='absolute top-2 right-2 rounded-full p-2 bg-gray-800 bg-opacity-75 cursor-pointer opacity-0 group-hover/cover:opacity-100 transition duration-200'
										onClick={() => coverimgRef.current.click()}
									>
										<MdEdit className='w-5 h-5 text-white' />
									</div>
								)}

								<input
									type='file'
									hidden
									ref={coverimgRef}
									onChange={(e) => handleImgChange(e, "coverimg")}
								/>
								<input
									type='file'
									hidden
									ref={profileimgRef}
									onChange={(e) => handleImgChange(e, "profileimg")}
								/>
								{/* USER AVATAR */}
								<div className='avatar absolute -bottom-16 left-4'>
									<div className='w-32 rounded-full relative group/avatar'>
										<img src={profileimg || user?.profileimg || "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png"} />
										<div className='absolute top-5 right-3 p-1 bg-primary rounded-full group-hover/avatar:opacity-100 opacity-0 cursor-pointer'>
											{isMyProfile && (
												<MdEdit
													className='w-4 h-4 text-white'
													onClick={() => profileimgRef.current.click()}
												/>
											)}
										</div>
									</div>
								</div>
							</div>
							<div className='flex justify-end px-4 mt-5'>
								{isMyProfile && <EditProfileModal authUser={authUser} />}
								{!isMyProfile && (
									<button
										className='btn btn-primary btn-outline border-0 rounded-full btn-sm'
										onClick={() => follow(user?._id)}
									>
										{isPending && <LoadingSpinner size="sm"/>}
										{!isPending && amifollowing && "Unfollow"}
										{!isPending && !amifollowing && "Follow"}
									</button>
								)}
								{(coverimg || profileimg) && (
									<button
										className='btn btn-primary rounded-full btn-sm text-white px-4 ml-2'
										onClick={async() => {await updateprofile()
										setcoverimg(null)
									    setprofileimg(null)}}
									>
										{isupdatingprofile ? "Updating...":"Update"}
									</button>
								)}
							</div>

							<div className='flex flex-col gap-4 mt-14 px-4'>
								<div className='flex flex-col'>
									<span className='font-bold text-lg'>{user?.fullName}</span>
									<span className='text-sm text-secondary'>@{user?.username}</span>
									<span className='text-sm my-1'>{user?.bio}</span>
								</div>

								<div className='flex gap-2 flex-wrap'>
									{user?.link && (
										<div className='flex gap-1 items-center '>
											<>
												<FaLink className='w-3 h-3 text-slate-500' />
												<a
													href='https://youtube.com/@asaprogrammer_'
													target='_blank'
													rel='noreferrer'
													className='text-sm text-blue-500 hover:underline'
												>
													youtube.com/@asaprogrammer_
												</a>
											</>
										</div>
									)}
									<div className='flex gap-2 items-center'>
										<IoCalendarOutline className='w-4 h-4 text-slate-500' />
										<span className='text-sm text-slate-500'>{membersincedate}</span>
									</div>
								</div>
								<div className='flex gap-2'>
									<div className='flex gap-1 items-center'>
										<span className='font-bold text-xs'>{user?.following.length}</span>
										<span className='text-slate-500 text-xs'>Following</span>
									</div>
									<div className='flex gap-1 items-center'>
										<span className='font-bold text-xs'>{user?.followers.length}</span>
										<span className='text-slate-500 text-xs'>Followers</span>
									</div>
								</div>
							</div>
							<div className='flex w-full border-b border-gray-700 mt-4'>
								<div
									className='flex justify-center flex-1 p-3 hover:bg-stone-800 transition duration-300 relative cursor-pointer'
									onClick={() => setfeedType("posts")}
								>
									Posts
									{feedType === "posts" && (
										<div className='absolute bottom-0 w-10 h-1 rounded-full bg-primary' />
									)}
								</div>
								<div
									className='flex justify-center flex-1 p-3  hover:bg-stone-800 transition duration-300 relative cursor-pointer'
									onClick={() => setfeedType("likes")}
								>
									Likes
									{feedType === "likes" && (
										<div className='absolute bottom-0 w-10  h-1 rounded-full bg-primary' />
									)}
								</div>
							</div>
						</>
					)}

					<Posts feedtype={feedType} username={username} userid ={user?._id} />
				</div>
			</div>
		</>
	);
};
export default ProfilePage;