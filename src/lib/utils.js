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
