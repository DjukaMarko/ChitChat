import { clsx } from "clsx"
import moment from "moment";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const refresh = () => window.location.reload(true);


export const formatTimeAgo = (timestamp) => {
  const currentTime = moment();
  const messageTime = moment(timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6);
  const diffInMinutes = currentTime.diff(messageTime, 'minutes');
  const diffInHours = currentTime.diff(messageTime, 'hours');
  const diffInDays = currentTime.diff(messageTime, 'days');

  if (diffInMinutes < 1) {
    return 'now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} min${diffInMinutes > 1 ? 's' : ''}`;
  } else if (diffInHours < 24) {
    return `${diffInHours} h`;
  } else if (diffInDays < 7) {
    return messageTime.format('ddd').toLowerCase(); // Display the weekday if it's within the same week
  } else {
    return messageTime.format('MMMM D, YYYY'); // Fallback to a full date format
  }
}

export const compareTimestamps = (obj1, obj2) => {
  const timestamp1 = moment.unix(obj1?.sentAt?.seconds);
  const timestamp2 = moment.unix(obj2?.sentAt?.seconds);
  const now = moment();

  if (isNaN(Date.parse(timestamp1)) || isNaN(Date.parse(timestamp2))) {
    return false;
  }

  // Get the object with the latest timestamp
  const latestObject = timestamp1.isAfter(timestamp2) ? obj1 : obj2;
  const latestTimestamp = moment.unix(latestObject?.sentAt?.seconds);

  // Check if the latest timestamp is today
  if (latestTimestamp.isSame(now, 'day')) {
    // Return hours and minutes
    return latestTimestamp.format("h:mm A");
  }

  // Check if the latest timestamp is yesterday
  if (latestTimestamp.isSame(now.clone().subtract(1, 'day'), 'day')) {
    // Return 'Yesterday' with hours and minutes
    return "Yesterday, " + latestTimestamp.format("h:mm A");
  }

  // Return the whole date
  return latestTimestamp.format("MMM DD, h:mm A");
}

export const isDifference = (obj1, obj2, textLength, index) => {
  if (obj1 === undefined || obj2 === undefined) return;

  const timestamp1 = moment.unix(obj1?.sentAt?.seconds);
  const timestamp2 = moment.unix(obj2?.sentAt?.seconds);

  const timeDifference = Math.abs(timestamp2.diff(timestamp1, 'minutes'));

  if (timeDifference > 15 || index === textLength - 1) {
    return true;
  }

  return false;
}

export const hasOnlyBlankSpaces = (str) => {
  const regex = /^\s*$/;
  return regex.test(str);
}

export const isValidUrl = urlString => {
  if (urlString === undefined) return;
  const urlRegex = /^(?:https?|ftp):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?|^((?!www\.)[\w-]+\.)+[a-z]{2,6}(:[0-9]{1,5})?([\w/?.#=%&~-]*)?$/i;
  return urlRegex.test(urlString);
}

export function areGroupsEqual(json1, json2) {
  const members1 = json1.members || [];
  const members2 = json2.members || [];

  if (members1.length !== members2.length) {
    return false; // If lengths are different, arrays are not equal
  }

  if (json1.group_name !== json2.group_name) {
    return false;
  }

  return true; // Arrays are equal
}



export const fetchDataFromLink = async (url) => {
  try {
    const response = await fetch(`https://link-preview-three.vercel.app/api/link-preview?url=${url}`);
    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Error fetching metadata:', error);
  }
}
export const firebaseStoragePattern = /^https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/[^\/]+\/o\/([^?]+)\?alt=media&token=[^?]+$/;
export const parseFirebaseStorageLink = (link) => {
  // Try to match the link with the pattern
  const match = link.match(firebaseStoragePattern);

  if (match) {
    // Extract the document name from the matched group
    const [fullMatch, documentNameEncoded] = match;
    const documentNameDecoded = decodeURIComponent(documentNameEncoded);
    const parts = documentNameDecoded.split('/');
    const fileName = parts.pop();

    // Extract the extension
    const extension = fileName.split('.').pop();

    return { fileName, extension };
  } else {
    // If the link doesn't match the pattern, return null or handle it as needed
    return null;
  }
}


export const possibleImageFormat = ["jpg", "png", "jpeg"];


export const scrollToBottom = (ref) => {
  const scrollContainer = ref.current;
  if (scrollContainer) {
    const isScrolledToBottom = scrollContainer.scrollHeight - scrollContainer.clientHeight <= scrollContainer.scrollTop + 1;

    if (!isScrolledToBottom) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }
}