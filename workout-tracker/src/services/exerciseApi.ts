import axios from 'axios';
import { Exercise } from '../types';
import { API_NINJAS_EXERCISE_URL } from '../constants';

const API_KEY = process.env.EXPO_PUBLIC_API_NINJAS_KEY || '';

export const searchExercises = async (query: string): Promise<Exercise[]> => {
  try {
    const response = await axios.get<Exercise[]>(API_NINJAS_EXERCISE_URL, {
      headers: {
        'X-Api-Key': API_KEY,
      },
      params: {
        name: query,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return [];
  }
};

export const searchExercisesByMuscle = async (muscle: string): Promise<Exercise[]> => {
  try {
    const response = await axios.get<Exercise[]>(API_NINJAS_EXERCISE_URL, {
      headers: {
        'X-Api-Key': API_KEY,
      },
      params: {
        muscle,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching exercises by muscle:', error);
    return [];
  }
};