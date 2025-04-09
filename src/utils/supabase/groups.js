import { supabase } from '../supabaseClient';

// Fetch all public groups
export const fetchPublicGroups = async () => {
    console.log('Fetching public groups...');
    try {
        // First get the groups
        const { data: groups, error: groupsError } = await supabase
            .from('groups')
            .select(`
                id,
                name,
                description,
                privacy,
                profile_image,
                landscape_image,
                created_at,
                created_by,
                creator:account_profiles!created_by(
                    name,
                    profile_picture
                )
            `)
            .eq('privacy', 'public')
            .order('created_at', { ascending: false });

        if (groupsError) {
            console.error('Error fetching groups:', groupsError);
            throw groupsError;
        }

        // Then get member counts in a separate query
        const memberCounts = await Promise.all(
            groups.map(async (group) => {
                const { count, error: countError } = await supabase
                    .from('group_members')
                    .select('*', { count: 'exact', head: true })
                    .eq('group_id', group.id)
                    .eq('status', 'accepted');

                if (countError) {
                    console.error(`Error fetching member count for group ${group.id}:`, countError);
                    return 0;
                }
                return count || 0;
            })
        );

        // Combine groups with member counts
        const groupsWithCounts = groups.map((group, index) => ({
            ...group,
            memberCount: memberCounts[index]
        }));

        return groupsWithCounts;
    } catch (error) {
        console.error('Error in fetchPublicGroups:', error);
        throw error;
    }
};

// Fetch groups for a specific user
export const fetchUserGroups = async () => {
    console.log('Fetching user groups...');
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user found');

        // First get user's memberships
        const { data: memberships, error: membershipError } = await supabase
            .from('group_members')
            .select('group_id')
            .eq('user_id', user.id)
            .eq('status', 'accepted');

        if (membershipError) {
            console.error('Error fetching user memberships:', membershipError);
            throw membershipError;
        }

        console.log('Successfully fetched user memberships:', memberships);

        if (!memberships.length) {
            console.log('User is not a member of any groups');
            return [];
        }

        // Then get the groups
        const groupIds = memberships.map(m => m.group_id);
        const { data: groups, error: groupsError } = await supabase
            .from('groups')
            .select(`
                id,
                name,
                description,
                privacy,
                profile_image,
                landscape_image,
                created_at,
                created_by,
                creator:account_profiles!created_by(
                    name,
                    profile_picture
                )
            `)
            .in('id', groupIds);

        if (groupsError) {
            console.error('Error fetching groups:', groupsError);
            throw groupsError;
        }

        // Get member counts
        const memberCounts = await Promise.all(
            groups.map(async (group) => {
                const { count, error: countError } = await supabase
                    .from('group_members')
                    .select('*', { count: 'exact', head: true })
                    .eq('group_id', group.id)
                    .eq('status', 'accepted');

                if (countError) {
                    console.error(`Error fetching member count for group ${group.id}:`, countError);
                    return 0;
                }
                return count || 0;
            })
        );

        return groups.map((group, index) => ({
            ...group,
            memberCount: memberCounts[index]
        }));
    } catch (error) {
        console.error('Error in fetchUserGroups:', error);
        throw error;
    }
};

// Fetch pending group invites
export const fetchPendingInvites = async () => {
    console.log('Fetching pending invites...');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.error('No authenticated user found');
        throw new Error('User not authenticated');
    }

    try {
        // First get the pending memberships
        const { data: memberships, error: membershipError } = await supabase
            .from('group_members')
            .select('group_id')
            .eq('user_id', user.id)
            .eq('status', 'pending');

        if (membershipError) {
            console.error('Error fetching pending memberships:', membershipError);
            throw membershipError;
        }

        console.log('Successfully fetched pending memberships:', memberships);

        if (!memberships.length) {
            console.log('No pending invites found');
            return [];
        }

        // Then fetch the actual groups
        const groupIds = memberships.map(m => m.group_id);
        const { data: groups, error: groupsError } = await supabase
            .from('groups')
            .select(`
                id,
                name,
                description,
                privacy,
                profile_image,
                landscape_image,
                created_at,
                created_by:account_profiles!user_id (
                    name,
                    profile_picture
                )
            `)
            .in('id', groupIds);

        if (groupsError) {
            console.error('Error fetching pending invite groups:', groupsError);
            throw groupsError;
        }

        console.log('Successfully fetched pending invite groups:', groups);

        // Get member counts
        const memberCounts = await Promise.all(
            groups.map(async (group) => {
                const { count, error: countError } = await supabase
                    .from('group_members')
                    .select('*', { count: 'exact', head: true })
                    .eq('group_id', group.id)
                    .eq('status', 'accepted');

                if (countError) {
                    console.error(`Error fetching member count for group ${group.id}:`, countError);
                    return 0;
                }
                return count || 0;
            })
        );

        console.log('Successfully fetched member counts:', memberCounts);

        return groups.map((group, index) => ({
            ...group,
            memberCount: memberCounts[index]
        }));
    } catch (error) {
        console.error('Error in fetchPendingInvites:', error);
        throw error;
    }
};

// Create a new group
export const createGroup = async (groupData) => {
    console.log('Creating new group with data:', groupData);
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user found');

        // Get or create user profile
        const { data: profile, error: profileError } = await supabase
            .from('account_profiles')
            .select('id')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error('Error fetching profile:', profileError);
            // Create profile if it doesn't exist
            const { data: newProfile, error: createProfileError } = await supabase
                .from('account_profiles')
                .insert({
                    id: user.id,
                    name: user.email.split('@')[0],
                    profile_picture: null
                })
                .select('id')
                .single();

            if (createProfileError) throw createProfileError;
            profile = newProfile;
        }

        // Upload profile image if provided
        let profileImageUrl = null;
        if (groupData.profileImage) {
            const profileFileName = `${user.id}-${Date.now()}-profile`;
            const { data: profileData, error: profileError } = await supabase.storage
                .from('group-images')
                .upload(
                    `profile-images/${profileFileName}`,
                    groupData.profileImage,
                    { contentType: groupData.profileImage.type }
                );

            if (profileError) throw profileError;

            const { data: { publicUrl: profilePublicUrl } } = supabase.storage
                .from('group-images')
                .getPublicUrl(`profile-images/${profileFileName}`);

            profileImageUrl = profilePublicUrl;
        }

        // Upload landscape image if provided
        let landscapeImageUrl = null;
        if (groupData.landscapeImage) {
            const landscapeFileName = `${user.id}-${Date.now()}-landscape`;
            const { data: landscapeData, error: landscapeError } = await supabase.storage
                .from('group-images')
                .upload(
                    `landscape-images/${landscapeFileName}`,
                    groupData.landscapeImage,
                    { contentType: groupData.landscapeImage.type }
                );

            if (landscapeError) throw landscapeError;

            const { data: { publicUrl: landscapePublicUrl } } = supabase.storage
                .from('group-images')
                .getPublicUrl(`landscape-images/${landscapeFileName}`);

            landscapeImageUrl = landscapePublicUrl;
        }

        // Create the group using the profile.id
        const { data: group, error: groupError } = await supabase
            .from('groups')
            .insert({
                name: groupData.name,
                description: groupData.description,
                privacy: groupData.privacy,
                created_by: profile.id,
                profile_image: profileImageUrl,
                landscape_image: landscapeImageUrl
            })
            .select()
            .single();

        if (groupError) throw groupError;

        console.log('Successfully created group:', group);

        // Add creator as admin member
        const { error: memberError } = await supabase
            .from('group_members')
            .insert({
                group_id: group.id,
                user_id: profile.id,
                role: 'admin',
                status: 'accepted'
            });

        if (memberError) throw memberError;

        console.log('Successfully added creator as admin');

        return group;
    } catch (error) {
        console.error('Error in createGroup:', error);
        throw error;
    }
};

// Fetch a single group by ID
export const fetchGroupById = async (groupId) => {
    const { data, error } = await supabase
        .from('groups')
        .select(`
            *,
            creator:account_profiles!created_by(
                name,
                profile_picture
            ),
            members:group_members(
                user_id,
                role,
                status,
                profiles:account_profiles!user_id(
                    name,
                    profile_picture
                )
            )
        `)
        .eq('id', groupId)
        .single();

    if (error) throw error;
    return {
        ...data,
        memberCount: data.members.filter(m => m.status === 'accepted').length
    };
};

// Fetch group posts
export const fetchGroupPosts = async (groupId) => {
    const { data, error } = await supabase
        .from('group_posts')
        .select(`
            *,
            author:account_profiles!user_id (
                name,
                profile_picture
            )
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

// Create a group post
export const createGroupPost = async (groupId, content) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('group_posts')
        .insert({
            group_id: groupId,
            user_id: user.id,
            content
        })
        .select(`
            *,
            author:account_profiles!user_id (
                name,
                profile_picture
            )
        `)
        .single();

    if (error) throw error;
    return data;
};

// Join a group
export const joinGroup = async (groupId) => {
    console.log('Attempting to join group:', groupId);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.error('No authenticated user found');
        throw new Error('User not authenticated');
    }

    try {
        // First check if user has a profile
        const { data: profile, error: profileError } = await supabase
            .from('account_profiles')
            .select('id')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            console.log('Profile not found, creating one...');
            // Create a basic profile if none exists
            const { data: newProfile, error: createProfileError } = await supabase
                .from('account_profiles')
                .insert({
                    id: user.id,
                    name: user.email.split('@')[0],
                    profile_picture: null
                })
                .select('id')
                .single();

            if (createProfileError) {
                console.error('Error creating profile:', createProfileError);
                throw createProfileError;
            }
            profile = newProfile;
        }

        // Check if the group is public or private
        const { data: group, error: groupError } = await supabase
            .from('groups')
            .select('privacy')
            .eq('id', groupId)
            .single();

        if (groupError) {
            console.error('Error fetching group:', groupError);
            throw groupError;
        }

        // Set status based on group privacy
        const status = group.privacy === 'public' ? 'accepted' : 'pending';
        console.log(`Group is ${group.privacy}, setting status to ${status}`);

        // Now try to join the group
        const { error: joinError } = await supabase
            .from('group_members')
            .insert({
                group_id: groupId,
                user_id: profile.id,
                status: status,
                role: 'member'
            });

        if (joinError) {
            console.error('Error joining group:', joinError);
            throw joinError;
        }

        console.log(`Successfully ${status === 'accepted' ? 'joined' : 'requested to join'} group`);
    } catch (error) {
        console.error('Error in joinGroup:', error);
        throw error;
    }
};

// Accept/reject group join request
export const updateMemberStatus = async (groupId, userId, status) => {
    const { error } = await supabase
        .from('group_members')
        .update({ status })
        .eq('group_id', groupId)
        .eq('user_id', userId);

    if (error) throw error;
};

// Leave a group
export const leaveGroup = async (groupId) => {
    console.log('Leaving group:', groupId);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.error('No authenticated user found');
        throw new Error('User not authenticated');
    }

    try {
        const { error } = await supabase
            .from('group_members')
            .delete()
            .eq('group_id', groupId)
            .eq('user_id', user.id);

        if (error) {
            console.error('Error leaving group:', error);
            throw error;
        }

        console.log('Successfully left group');
    } catch (error) {
        console.error('Error in leaveGroup:', error);
        throw error;
    }
};

// Check if user is a member of a group
export const checkGroupMembership = async (groupId) => {
    console.log('Checking group membership for group:', groupId);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.error('No authenticated user found');
        throw new Error('User not authenticated');
    }

    try {
        const { data, error } = await supabase
            .from('group_members')
            .select('status, role')
            .eq('group_id', groupId)
            .eq('user_id', user.id)
            .single();

        if (error) {
            console.error('Error checking group membership:', error);
            throw error;
        }

        console.log('Group membership status:', data);
        return data;
    } catch (error) {
        console.error('Error in checkGroupMembership:', error);
        throw error;
    }
};

// Update group member role
export const updateMemberRole = async (groupId, userId, role) => {
    console.log('Updating member role:', { groupId, userId, role });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.error('No authenticated user found');
        throw new Error('User not authenticated');
    }

    try {
        // First check if the current user is an admin
        const { data: adminCheck, error: adminError } = await supabase
            .from('group_members')
            .select('role')
            .eq('group_id', groupId)
            .eq('user_id', user.id)
            .eq('status', 'accepted')
            .single();

        if (adminError || adminCheck?.role !== 'admin') {
            throw new Error('Only group admins can update member roles');
        }

        const { error } = await supabase
            .from('group_members')
            .update({ role })
            .eq('group_id', groupId)
            .eq('user_id', userId);

        if (error) {
            console.error('Error updating member role:', error);
            throw error;
        }

        console.log('Successfully updated member role');
    } catch (error) {
        console.error('Error in updateMemberRole:', error);
        throw error;
    }
};

// Get group members
export const getGroupMembers = async (groupId) => {
    console.log('Fetching members for group:', groupId);
    try {
        const { data, error } = await supabase
            .from('group_members')
            .select(`
                user_id,
                role,
                status,
                profiles:account_profiles!user_id (
                    name,
                    profile_picture
                )
            `)
            .eq('group_id', groupId)
            .eq('status', 'accepted');

        if (error) {
            console.error('Error fetching group members:', error);
            throw error;
        }

        console.log('Successfully fetched group members:', data);
        return data;
    } catch (error) {
        console.error('Error in getGroupMembers:', error);
        throw error;
    }
};

// Fetch groups created by the user
export const fetchCreatedGroups = async () => {
    console.log('Fetching groups created by user...');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.error('No authenticated user found');
        throw new Error('User not authenticated');
    }

    try {
        // First get the user's profile ID
        const { data: profile, error: profileError } = await supabase
            .from('account_profiles')
            .select('id')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error('Error fetching profile:', profileError);
            throw profileError;
        }

        const { data: groups, error: groupsError } = await supabase
            .from('groups')
            .select(`
                id,
                name,
                description,
                privacy,
                profile_image,
                landscape_image,
                created_at,
                creator:account_profiles!created_by(
                    name,
                    profile_picture
                )
            `)
            .eq('created_by', profile.id)
            .order('created_at', { ascending: false });

        if (groupsError) {
            console.error('Error fetching created groups:', groupsError);
            throw groupsError;
        }

        console.log('Successfully fetched created groups:', groups);

        // Get member counts
        const memberCounts = await Promise.all(
            groups.map(async (group) => {
                const { count, error: countError } = await supabase
                    .from('group_members')
                    .select('*', { count: 'exact', head: true })
                    .eq('group_id', group.id)
                    .eq('status', 'accepted');

                if (countError) {
                    console.error(`Error fetching member count for group ${group.id}:`, countError);
                    return 0;
                }
                return count || 0;
            })
        );

        return groups.map((group, index) => ({
            ...group,
            memberCount: memberCounts[index]
        }));
    } catch (error) {
        console.error('Error in fetchCreatedGroups:', error);
        throw error;
    }
};

// Delete a group
export const deleteGroup = async (groupId) => {
    console.log('Attempting to delete group:', groupId);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.error('No authenticated user found');
        throw new Error('User not authenticated');
    }

    try {
        // First verify that the user is the creator of the group
        const { data: group, error: groupError } = await supabase
            .from('groups')
            .select('created_by')
            .eq('id', groupId)
            .single();

        if (groupError) {
            console.error('Error fetching group:', groupError);
            throw groupError;
        }

        if (group.created_by !== user.id) {
            throw new Error('Only the group creator can delete the group');
        }

        // Delete the group
        const { error: deleteError } = await supabase
            .from('groups')
            .delete()
            .eq('id', groupId);

        if (deleteError) {
            console.error('Error deleting group:', deleteError);
            throw deleteError;
        }

        console.log('Successfully deleted group');
    } catch (error) {
        console.error('Error in deleteGroup:', error);
        throw error;
    }
};

// Update group information
export const updateGroup = async (groupId, { name, description, profileImage, landscapeImage }) => {
    console.log('Attempting to update group:', groupId);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.error('No authenticated user found');
        throw new Error('User not authenticated');
    }

    try {
        // First verify that the user is the creator of the group
        const { data: group, error: groupError } = await supabase
            .from('groups')
            .select('created_by')
            .eq('id', groupId)
            .single();

        if (groupError) {
            console.error('Error fetching group:', groupError);
            throw groupError;
        }

        if (group.created_by !== user.id) {
            throw new Error('Only the group creator can update the group');
        }

        let updates = { name, description };

        // Handle profile image update if provided
        if (profileImage) {
            const profileFileName = `${user.id}-${Date.now()}-profile`;
            const { error: profileError } = await supabase.storage
                .from('group-images')
                .upload(`profile-images/${profileFileName}`, profileImage);

            if (profileError) {
                console.error('Error uploading profile image:', profileError);
                throw profileError;
            }

            const { data: { publicUrl: profilePublicUrl } } = supabase.storage
                .from('group-images')
                .getPublicUrl(`profile-images/${profileFileName}`);
            
            updates.profile_image = profilePublicUrl;
        }

        // Handle landscape image update if provided
        if (landscapeImage) {
            const landscapeFileName = `${user.id}-${Date.now()}-landscape`;
            const { error: landscapeError } = await supabase.storage
                .from('group-images')
                .upload(`landscape-images/${landscapeFileName}`, landscapeImage);

            if (landscapeError) {
                console.error('Error uploading landscape image:', landscapeError);
                throw landscapeError;
            }

            const { data: { publicUrl: landscapePublicUrl } } = supabase.storage
                .from('group-images')
                .getPublicUrl(`landscape-images/${landscapeFileName}`);
            
            updates.landscape_image = landscapePublicUrl;
        }

        // Update the group
        const { error: updateError } = await supabase
            .from('groups')
            .update(updates)
            .eq('id', groupId);

        if (updateError) {
            console.error('Error updating group:', updateError);
            throw updateError;
        }

        console.log('Successfully updated group');
    } catch (error) {
        console.error('Error in updateGroup:', error);
        throw error;
    }
}; 