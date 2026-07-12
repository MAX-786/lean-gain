/* ============================================================
   Lean Gain — static content
   Profile targets, rotating meal templates, 30-day mapping,
   recipes, weekly grocery lists, workout plan.
   ============================================================ */

const PROFILE = {
  age: 24,
  heightLabel: "5'11\" (180 cm)",
  startWeightKg: 57,
  bmiStart: 17.6,
  targetWeightRange: "61–63 kg",
  timelineWeeks: "10–12 weeks",
  weeklyGainTarget: "0.25–0.5 kg/week",
  bp: "121/71 mmHg — normal",
  calories: "2,700–3,000 kcal/day",
  protein: "110–130 g/day",
  fat: "70–90 g/day",
  carbs: "350–400 g/day",
  water: "2.5–3 L/day",
  mealFrequency: "6–7 small meals, every 2.5–3 hours",
  metabolismNote:
    "Small appetite + fast metabolism means big plates backfire — they get skipped. " +
    "This plan uses small, calorie-dense meals (milk, paneer, nut butters, eggs, dry fruits) " +
    "eaten often instead of three large meals. Never skip a meal; if shakiness, sweating, or " +
    "dizziness show up between meals, eat something with protein + carbs right away and get it " +
    "checked if it keeps happening."
};

/* ---------- Meal templates (7 small meals/day) ----------
   Each template ~2,700–3,000 kcal / 110–130g protein across the day.
   30 days are mapped onto these 12 templates further down. */

const MEAL_TEMPLATES = [
  {
    id: "T1",
    meals: [
      { time: "7:00 AM", label: "Wake-Up", items: "Warm milk (250ml), 6 soaked almonds, 2 dates", kcal: 260, protein: 9 },
      { time: "9:00 AM", label: "Breakfast", items: "4-egg omelette + 2 whole wheat rotis", kcal: 520, protein: 28 },
      { time: "11:30 AM", label: "Mid-Morning", items: "Banana + small handful roasted peanuts", kcal: 260, protein: 8 },
      { time: "1:30 PM", label: "Lunch", items: "2 chapatis, 3/4 cup rice, 150g chicken curry, 1 small bowl dal, salad", kcal: 620, protein: 32 },
      { time: "4:00 PM", label: "Evening", items: "Peanut butter (2 tbsp) on 1 slice toast + banana", kcal: 380, protein: 12 },
      { time: "7:30 PM", label: "Dinner", items: "2 chapatis, 150g paneer bhurji, cooked vegetables", kcal: 560, protein: 26 },
      { time: "10:00 PM", label: "Bedtime", items: "Warm milk (250ml) + 1 tbsp peanut butter", kcal: 260, protein: 10 }
    ]
  },
  {
    id: "T2",
    meals: [
      { time: "7:00 AM", label: "Wake-Up", items: "Banana + 2 walnuts + 1 date", kcal: 210, protein: 4 },
      { time: "9:00 AM", label: "Breakfast", items: "Oats cooked in milk with banana, peanut butter, dry fruits", kcal: 540, protein: 20 },
      { time: "11:30 AM", label: "Mid-Morning", items: "Apple + roasted chana (small handful)", kcal: 220, protein: 9 },
      { time: "1:30 PM", label: "Lunch", items: "Rajma chawal (3/4 cup rice, 1 bowl rajma) + curd", kcal: 600, protein: 24 },
      { time: "4:00 PM", label: "Evening", items: "Mango/banana smoothie (small glass, 200ml)", kcal: 320, protein: 10 },
      { time: "7:30 PM", label: "Dinner", items: "Grilled chicken (150g) + 2 rotis + sautéed vegetables", kcal: 560, protein: 34 },
      { time: "10:00 PM", label: "Bedtime", items: "Warm milk (250ml) + 4 walnuts", kcal: 260, protein: 9 }
    ]
  },
  {
    id: "T3",
    meals: [
      { time: "7:00 AM", label: "Wake-Up", items: "Warm milk (250ml) + 2 dates", kcal: 220, protein: 8 },
      { time: "9:00 AM", label: "Breakfast", items: "4-egg omelette + butter toast (2 slices)", kcal: 500, protein: 27 },
      { time: "11:30 AM", label: "Mid-Morning", items: "Dates (3) + almonds (6)", kcal: 240, protein: 5 },
      { time: "1:30 PM", label: "Lunch", items: "Paneer pulao (1 cup) + raita", kcal: 610, protein: 24 },
      { time: "4:00 PM", label: "Evening", items: "Fruit chaat (banana, apple, pomegranate) + roasted peanuts", kcal: 300, protein: 8 },
      { time: "7:30 PM", label: "Dinner", items: "Chicken keema (150g) + 2 chapatis", kcal: 580, protein: 34 },
      { time: "10:00 PM", label: "Bedtime", items: "Warm milk (250ml)", kcal: 170, protein: 8 }
    ]
  },
  {
    id: "T4",
    meals: [
      { time: "7:00 AM", label: "Wake-Up", items: "Small glass milk + 2 walnuts", kcal: 200, protein: 7 },
      { time: "9:00 AM", label: "Breakfast", items: "Vegetable poha + 2 boiled eggs", kcal: 480, protein: 22 },
      { time: "11:30 AM", label: "Mid-Morning", items: "Banana", kcal: 150, protein: 2 },
      { time: "1:30 PM", label: "Lunch", items: "1 cup rice, dal, 150g paneer curry, salad", kcal: 600, protein: 26 },
      { time: "4:00 PM", label: "Evening", items: "Peanut butter toast (1 slice) + small banana", kcal: 340, protein: 10 },
      { time: "7:30 PM", label: "Dinner", items: "Fish curry (150g) + 3/4 cup rice", kcal: 570, protein: 32 },
      { time: "10:00 PM", label: "Bedtime", items: "Warm milk (250ml) + 1 tbsp honey", kcal: 230, protein: 8 }
    ]
  },
  {
    id: "T5",
    meals: [
      { time: "7:00 AM", label: "Wake-Up", items: "Banana + 6 almonds", kcal: 220, protein: 6 },
      { time: "9:00 AM", label: "Breakfast", items: "Banana peanut butter protein pancakes (2 small)", kcal: 480, protein: 24 },
      { time: "11:30 AM", label: "Mid-Morning", items: "Mixed nuts (small handful)", kcal: 220, protein: 7 },
      { time: "1:30 PM", label: "Lunch", items: "Chole (3/4 bowl) + 3/4 cup rice", kcal: 590, protein: 22 },
      { time: "4:00 PM", label: "Evening", items: "Banana shake (200ml, milk + banana + oats)", kcal: 340, protein: 12 },
      { time: "7:30 PM", label: "Dinner", items: "Chicken wrap (1 whole wheat tortilla, 120g chicken)", kcal: 560, protein: 32 },
      { time: "10:00 PM", label: "Bedtime", items: "Small bowl curd + honey", kcal: 180, protein: 9 }
    ]
  },
  {
    id: "T6",
    meals: [
      { time: "7:00 AM", label: "Wake-Up", items: "Warm milk (250ml)", kcal: 170, protein: 8 },
      { time: "9:00 AM", label: "Breakfast", items: "Paneer sandwich (2 slices bread, 80g paneer)", kcal: 470, protein: 22 },
      { time: "11:30 AM", label: "Mid-Morning", items: "Orange + small handful peanuts", kcal: 230, protein: 7 },
      { time: "1:30 PM", label: "Lunch", items: "Chicken biryani (1 cup) + raita", kcal: 620, protein: 28 },
      { time: "4:00 PM", label: "Evening", items: "Dry fruit smoothie (small glass)", kcal: 330, protein: 9 },
      { time: "7:30 PM", label: "Dinner", items: "Dal, 2 rotis, mixed vegetables", kcal: 500, protein: 20 },
      { time: "10:00 PM", label: "Bedtime", items: "Warm milk (250ml) + 2 dates", kcal: 220, protein: 8 }
    ]
  },
  {
    id: "T7",
    meals: [
      { time: "7:00 AM", label: "Wake-Up", items: "Small glass milk + 2 dates", kcal: 210, protein: 7 },
      { time: "9:00 AM", label: "Breakfast", items: "2 idli + sambar + 1 boiled egg", kcal: 440, protein: 18 },
      { time: "11:30 AM", label: "Mid-Morning", items: "Small fruit bowl (banana, apple)", kcal: 200, protein: 2 },
      { time: "1:30 PM", label: "Lunch", items: "Chicken curry (150g) + 1 cup rice", kcal: 610, protein: 32 },
      { time: "4:00 PM", label: "Evening", items: "Peanut chikki (small piece) + small glass milk", kcal: 340, protein: 10 },
      { time: "7:30 PM", label: "Dinner", items: "Paneer tikka (100g) + 2 chapatis", kcal: 540, protein: 26 },
      { time: "10:00 PM", label: "Bedtime", items: "Warm milk (250ml)", kcal: 170, protein: 8 }
    ]
  },
  {
    id: "T8",
    meals: [
      { time: "7:00 AM", label: "Wake-Up", items: "Banana + 2 walnuts", kcal: 200, protein: 4 },
      { time: "9:00 AM", label: "Breakfast", items: "Aloo-paneer paratha (1) + curd", kcal: 520, protein: 20 },
      { time: "11:30 AM", label: "Mid-Morning", items: "Roasted chana (small handful)", kcal: 200, protein: 10 },
      { time: "1:30 PM", label: "Lunch", items: "Creamy chicken rice bowl (small portion)", kcal: 640, protein: 34 },
      { time: "4:00 PM", label: "Evening", items: "Cheese garlic toast (1 slice)", kcal: 320, protein: 10 },
      { time: "7:30 PM", label: "Dinner", items: "Dal khichdi + small bowl curd", kcal: 520, protein: 18 },
      { time: "10:00 PM", label: "Bedtime", items: "Warm milk (250ml) + almonds", kcal: 240, protein: 9 }
    ]
  },
  {
    id: "T9",
    meals: [
      { time: "7:00 AM", label: "Wake-Up", items: "Small glass milk + 2 dates", kcal: 210, protein: 7 },
      { time: "9:00 AM", label: "Breakfast", items: "Upma with peanuts + 1 boiled egg", kcal: 460, protein: 18 },
      { time: "11:30 AM", label: "Mid-Morning", items: "Chikoo/mango (seasonal) + almonds", kcal: 220, protein: 4 },
      { time: "1:30 PM", label: "Lunch", items: "Rajma (3/4 bowl) + rice + salad", kcal: 590, protein: 22 },
      { time: "4:00 PM", label: "Evening", items: "High-protein white sauce pasta (small bowl)", kcal: 360, protein: 16 },
      { time: "7:30 PM", label: "Dinner", items: "Grilled fish (150g) + sautéed vegetables + 1 roti", kcal: 540, protein: 32 },
      { time: "10:00 PM", label: "Bedtime", items: "Warm milk (250ml)", kcal: 170, protein: 8 }
    ]
  },
  {
    id: "T10",
    meals: [
      { time: "7:00 AM", label: "Wake-Up", items: "Warm milk (250ml) + 2 walnuts", kcal: 210, protein: 8 },
      { time: "9:00 AM", label: "Breakfast", items: "Masala omelette roll (3 eggs, 1 roti)", kcal: 490, protein: 26 },
      { time: "11:30 AM", label: "Mid-Morning", items: "Small handful mixed nuts", kcal: 220, protein: 7 },
      { time: "1:30 PM", label: "Lunch", items: "Soy chunk pulao (1 cup) + curd", kcal: 580, protein: 26 },
      { time: "4:00 PM", label: "Evening", items: "Greek yogurt fruit bowl (small)", kcal: 320, protein: 14 },
      { time: "7:30 PM", label: "Dinner", items: "Palak paneer (100g paneer) + 2 rotis", kcal: 540, protein: 22 },
      { time: "10:00 PM", label: "Bedtime", items: "Warm milk (250ml) + honey", kcal: 220, protein: 8 }
    ]
  },
  {
    id: "T11",
    meals: [
      { time: "7:00 AM", label: "Wake-Up", items: "Banana + 6 soaked almonds", kcal: 230, protein: 6 },
      { time: "9:00 AM", label: "Breakfast", items: "Paneer cheela (2 small) + mint chutney", kcal: 460, protein: 22 },
      { time: "11:30 AM", label: "Mid-Morning", items: "Dry fruit laddoo (1 small)", kcal: 210, protein: 4 },
      { time: "1:30 PM", label: "Lunch", items: "Dal makhani (small bowl) + rice", kcal: 590, protein: 20 },
      { time: "4:00 PM", label: "Evening", items: "Egg fried rice (small bowl, post-workout)", kcal: 380, protein: 18 },
      { time: "7:30 PM", label: "Dinner", items: "Chicken stew (150g chicken) + 1 roti", kcal: 520, protein: 30 },
      { time: "10:00 PM", label: "Bedtime", items: "Warm milk (250ml)", kcal: 170, protein: 8 }
    ]
  },
  {
    id: "T12",
    meals: [
      { time: "7:00 AM", label: "Wake-Up", items: "Small glass milk + 2 dates", kcal: 210, protein: 7 },
      { time: "9:00 AM", label: "Breakfast", items: "Triple layer protein sandwich (peanut butter, banana, paneer)", kcal: 520, protein: 24 },
      { time: "11:30 AM", label: "Mid-Morning", items: "Roasted peanuts (small handful) + apple", kcal: 250, protein: 8 },
      { time: "1:30 PM", label: "Lunch", items: "Chicken curry (150g) + 2 chapatis + salad", kcal: 600, protein: 32 },
      { time: "4:00 PM", label: "Evening", items: "Classic weight-gain shake (small glass, 200ml)", kcal: 400, protein: 16 },
      { time: "7:30 PM", label: "Dinner", items: "Dry fruit kheer (small bowl, as dinner-side dessert) + paneer bhurji", kcal: 560, protein: 20 },
      { time: "10:00 PM", label: "Bedtime", items: "Warm milk (250ml)", kcal: 170, protein: 8 }
    ]
  }
];

// Compute per-template daily totals from the meals above.
MEAL_TEMPLATES.forEach(t => {
  t.totalKcal = t.meals.reduce((s, m) => s + m.kcal, 0);
  t.totalProtein = t.meals.reduce((s, m) => s + m.protein, 0);
});

// Map 30 calendar days onto the 12 templates (cycled, so every ~12 days repeats
// with the days offset so week boundaries don't always land on the same template).
const MEAL_PLAN_30_DAYS = Array.from({ length: 30 }, (_, i) => {
  const dayNum = i + 1;
  const template = MEAL_TEMPLATES[i % MEAL_TEMPLATES.length];
  return { day: dayNum, templateId: template.id };
});

/* ---------- Recipes ---------- */

const RECIPES = [
  {
    id: "r1", name: "Banana Peanut Butter Protein Pancakes", category: "Breakfast",
    kcal: 480, protein: 24, prepMin: 15,
    ingredients: ["2 bananas", "2 eggs", "1/2 cup oats", "1 tbsp peanut butter", "Pinch of cinnamon (optional)"],
    steps: ["Blend all ingredients into a smooth batter.", "Cook on a non-stick pan, 2–3 min per side.", "Serve with a drizzle of honey or fresh fruit."]
  },
  {
    id: "r2", name: "Cheesy Paneer Stuffed Paratha", category: "Breakfast",
    kcal: 520, protein: 22, prepMin: 20,
    ingredients: ["2 whole wheat dough balls", "150g grated paneer", "20–30g mozzarella", "Onion, coriander, green chilli", "Salt, pepper, chaat masala"],
    steps: ["Mix paneer, cheese and spices into a stuffing.", "Roll dough, stuff, and re-roll into a paratha.", "Cook on a hot tawa with a little ghee until golden. Serve with curd."]
  },
  {
    id: "r3", name: "Creamy Chicken Rice Bowl", category: "Lunch/Dinner",
    kcal: 640, protein: 45, prepMin: 15,
    ingredients: ["200g grilled chicken", "1.5 cups cooked rice", "Sautéed vegetables", "2 tbsp hung curd", "1 tsp butter", "Black pepper, herbs"],
    steps: ["Toss cooked rice and vegetables with butter.", "Top with grilled chicken and a dollop of hung curd.", "Finish with black pepper and herbs."]
  },
  {
    id: "r4", name: "High-Protein White Sauce Pasta", category: "Lunch/Dinner",
    kcal: 750, protein: 30, prepMin: 20,
    ingredients: ["Whole wheat pasta", "150g chicken or paneer", "Milk", "Cheese", "Mushrooms, capsicum, corn"],
    steps: ["Boil pasta until al dente.", "Make a quick white sauce with milk, cheese and a little flour.", "Toss in cooked chicken/paneer and vegetables, simmer 3–4 min."]
  },
  {
    id: "r5", name: "Chicken or Paneer Wrap", category: "Snack",
    kcal: 620, protein: 32, prepMin: 12,
    ingredients: ["1 whole wheat tortilla or roti", "Grilled chicken or paneer", "Lettuce, onion", "Cheese", "Yogurt-mint sauce"],
    steps: ["Warm the tortilla.", "Layer chicken/paneer, lettuce, onion, and cheese.", "Drizzle yogurt-mint sauce, roll tightly, and slice in half."]
  },
  {
    id: "r6", name: "Mango Weight-Gain Smoothie", category: "Shake",
    kcal: 750, protein: 18, prepMin: 5,
    ingredients: ["300ml milk", "1 ripe mango", "1 banana", "2 tbsp peanut butter", "3 tbsp oats", "5 almonds"],
    steps: ["Add all ingredients to a blender.", "Blend until smooth.", "Drink fresh — best right after or before a workout."]
  },
  {
    id: "r7", name: "Egg Fried Rice", category: "Lunch/Dinner",
    kcal: 620, protein: 22, prepMin: 15,
    ingredients: ["1 cup cooked rice", "3 whole eggs", "Mixed vegetables", "Soy sauce", "Garlic", "A little butter"],
    steps: ["Scramble eggs lightly and set aside.", "Sauté garlic and vegetables in butter.", "Add rice, soy sauce and eggs, toss on high heat for 2–3 min."]
  },
  {
    id: "r8", name: "Triple Layer Protein Sandwich", category: "Breakfast",
    kcal: 560, protein: 22, prepMin: 8,
    ingredients: ["3 slices whole wheat bread", "2 tbsp peanut butter", "1 banana, sliced", "1 tsp honey", "Cottage cheese (paneer) or scrambled egg"],
    steps: ["Spread peanut butter on one slice, add banana.", "Add the paneer/egg layer on the next slice.", "Stack, drizzle honey, and press together. Slice diagonally."]
  },
  {
    id: "r9", name: "Chocolate Overnight Oats", category: "Breakfast",
    kcal: 520, protein: 18, prepMin: 5,
    ingredients: ["1/2 cup oats", "200ml milk", "1 tbsp cocoa powder", "1 tbsp peanut butter", "1 banana", "1 tsp chia seeds"],
    steps: ["Mix everything in a jar.", "Cover and refrigerate overnight.", "Eat cold in the morning — no cooking needed."]
  },
  {
    id: "r10", name: "Chicken Keema with Butter Roti", category: "Lunch/Dinner",
    kcal: 680, protein: 38, prepMin: 25,
    ingredients: ["200g minced chicken", "Onion, tomato, ginger-garlic", "Spices (garam masala, turmeric, chilli)", "3 rotis with butter"],
    steps: ["Sauté onion, ginger-garlic until golden.", "Add keema and spices, cook covered 12–15 min.", "Serve hot with buttered rotis and salad."]
  },
  {
    id: "r11", name: "Homemade Healthy Burger", category: "Lunch/Dinner",
    kcal: 650, protein: 34, prepMin: 20,
    ingredients: ["Whole wheat bun", "Chicken breast or paneer patty", "Cheese slice", "Lettuce, tomato", "Homemade yogurt sauce"],
    steps: ["Pan-sear the chicken/paneer patty until cooked through.", "Toast the bun lightly.", "Layer patty, cheese, lettuce, tomato and sauce."]
  },
  {
    id: "r12", name: "Paneer Bhurji with Butter Toast", category: "Breakfast",
    kcal: 560, protein: 26, prepMin: 12,
    ingredients: ["150g crumbled paneer", "Onion, tomato, green chilli", "Turmeric, cumin", "4 slices buttered whole wheat toast"],
    steps: ["Sauté onion and tomato until soft.", "Add paneer and spices, cook 3–4 min.", "Serve hot with buttered toast."]
  },
  {
    id: "r13", name: "Dry Fruit Kheer", category: "Dessert",
    kcal: 420, protein: 12, prepMin: 25,
    ingredients: ["500ml milk", "3 tbsp rice or oats", "Dates, almonds, cashews, raisins", "Cardamom"],
    steps: ["Simmer milk with rice/oats on low heat, stirring often, 15–18 min.", "Add chopped dry fruits and cardamom.", "Simmer another 5 min until thickened. Serve warm or chilled."]
  },
  {
    id: "r14", name: "Healthy Homemade Pizza", category: "Lunch/Dinner",
    kcal: 700, protein: 28, prepMin: 25,
    ingredients: ["Whole wheat pizza base/dough", "Tomato sauce", "Chicken or paneer topping", "Mozzarella", "Vegetables"],
    steps: ["Spread tomato sauce on the base.", "Top with chicken/paneer, vegetables and mozzarella.", "Bake or pan-cook covered until cheese melts."]
  },
  {
    id: "r15", name: "Greek Yogurt Fruit Bowl", category: "Snack",
    kcal: 380, protein: 20, prepMin: 5,
    ingredients: ["1 cup thick curd or Greek yogurt", "Banana, apple, berries (if available)", "1 tsp honey", "Granola", "Nuts"],
    steps: ["Layer yogurt and chopped fruit in a bowl.", "Top with granola and nuts.", "Drizzle honey and serve immediately."]
  },
  {
    id: "r16", name: "Classic Weight-Gain Shake", category: "Shake",
    kcal: 780, protein: 28, prepMin: 5,
    ingredients: ["300ml milk", "2 bananas", "3 tbsp oats", "2 tbsp peanut butter", "5 almonds", "2 dates"],
    steps: ["Blend all ingredients until smooth.", "Adjust thickness with a little more milk if needed.", "Best had post-workout or as a bedtime top-up."]
  },
  {
    id: "r17", name: "Masala Omelette Roll", category: "Breakfast",
    kcal: 490, protein: 26, prepMin: 10,
    ingredients: ["3 eggs", "Onion, tomato, green chilli, coriander", "1 whole wheat roti", "Salt, pepper"],
    steps: ["Whisk eggs with chopped vegetables and spices.", "Cook as a thin omelette.", "Place on a warm roti and roll up tightly."]
  },
  {
    id: "r18", name: "Paneer Cheela (Besan Pancake)", category: "Breakfast",
    kcal: 460, protein: 22, prepMin: 15,
    ingredients: ["1 cup besan (gram flour)", "100g grated paneer", "Onion, coriander, green chilli", "Water, salt, turmeric"],
    steps: ["Whisk besan with water into a smooth batter, mix in paneer and vegetables.", "Pour onto a hot greased pan like a pancake.", "Cook both sides until golden. Serve with mint chutney."]
  },
  {
    id: "r19", name: "Soy Chunk Pulao", category: "Lunch/Dinner",
    kcal: 580, protein: 26, prepMin: 25,
    ingredients: ["1 cup rice", "1/2 cup soaked soy chunks", "Onion, whole spices", "Mixed vegetables", "Ghee"],
    steps: ["Sauté onion and whole spices in ghee.", "Add soy chunks and vegetables, sauté 2–3 min.", "Add rice and water, cook covered until done."]
  },
  {
    id: "r20", name: "Dal Makhani with Rice", category: "Lunch/Dinner",
    kcal: 590, protein: 20, prepMin: 30,
    ingredients: ["1 cup black dal (soaked)", "Butter, cream (small amount)", "Tomato, ginger-garlic", "Spices", "3/4 cup rice"],
    steps: ["Pressure cook dal until soft.", "Sauté tomato and spices, add dal, simmer 15 min.", "Finish with a swirl of butter/cream, serve with rice."]
  },
  {
    id: "r21", name: "Palak Paneer with Roti", category: "Lunch/Dinner",
    kcal: 540, protein: 22, prepMin: 20,
    ingredients: ["200g spinach, blanched and puréed", "150g paneer cubes", "Onion, garlic, ginger", "Cream (optional)", "2 rotis"],
    steps: ["Sauté onion, garlic, ginger until soft.", "Add spinach purée and simmer 5 min.", "Add paneer cubes, simmer 3–4 min, serve with rotis."]
  },
  {
    id: "r22", name: "Chicken Stew", category: "Lunch/Dinner",
    kcal: 540, protein: 34, prepMin: 30,
    ingredients: ["200g chicken pieces", "Potato, carrot, beans", "Coconut milk (small amount)", "Whole spices", "Curry leaves"],
    steps: ["Sauté whole spices and curry leaves briefly.", "Add chicken and vegetables, cook 15 min.", "Stir in coconut milk, simmer 5 more min. Serve warm."]
  },
  {
    id: "r23", name: "Roasted Chana & Nut Mix", category: "Snack",
    kcal: 320, protein: 14, prepMin: 2,
    ingredients: ["Roasted chana (chickpeas)", "Peanuts", "Almonds", "Raisins", "Pinch of chaat masala"],
    steps: ["Mix everything in a bowl.", "Store in an airtight jar for grab-and-go snacking.", "No cooking needed."]
  },
  {
    id: "r24", name: "Cheese Garlic Toast", category: "Snack",
    kcal: 380, protein: 12, prepMin: 8,
    ingredients: ["2 slices whole wheat bread", "Butter, garlic (minced)", "Grated cheese"],
    steps: ["Mix softened butter with minced garlic, spread on bread.", "Top with grated cheese.", "Toast in a pan or oven until cheese melts and bread is golden."]
  },
  {
    id: "r25", name: "Dates & Nut Energy Balls", category: "Snack",
    kcal: 340, protein: 8, prepMin: 10,
    ingredients: ["10 dates, pitted", "Mixed nuts (almonds, cashews, walnuts)", "1 tbsp peanut butter", "1 tbsp cocoa powder (optional)"],
    steps: ["Blend dates and nuts into a sticky mixture.", "Mix in peanut butter and cocoa.", "Roll into small balls and refrigerate. No cooking needed."]
  }
];

const RECIPE_CATEGORIES = ["All", "Breakfast", "Lunch/Dinner", "Snack", "Shake", "Dessert"];

/* ---------- Weekly grocery lists (approx. quantities + estimated INR price) ---------- */

const GROCERY_LISTS = [
  {
    week: 1,
    categories: [
      { name: "Protein", items: [
        { item: "Eggs", qty: "30 pcs", price: 210 },
        { item: "Chicken breast", qty: "1.5 kg", price: 450 },
        { item: "Paneer", qty: "1 kg", price: 400 },
        { item: "Milk", qty: "7 L", price: 490 },
        { item: "Curd", qty: "1 kg", price: 90 },
        { item: "Dal (mixed)", qty: "1 kg", price: 140 }
      ]},
      { name: "Carbs", items: [
        { item: "Rice", qty: "3 kg", price: 240 },
        { item: "Whole wheat flour", qty: "2 kg", price: 110 },
        { item: "Oats", qty: "500 g", price: 150 },
        { item: "Whole wheat bread", qty: "2 loaves", price: 100 }
      ]},
      { name: "Fats & Nuts", items: [
        { item: "Peanut butter", qty: "1 jar (500g)", price: 350 },
        { item: "Almonds", qty: "250 g", price: 300 },
        { item: "Walnuts", qty: "150 g", price: 250 },
        { item: "Mixed dry fruits", qty: "200 g", price: 220 }
      ]},
      { name: "Fruits & Veg", items: [
        { item: "Bananas", qty: "14 pcs", price: 140 },
        { item: "Seasonal fruit (apple/mango)", qty: "1 kg", price: 150 },
        { item: "Mixed vegetables", qty: "3 kg", price: 240 },
        { item: "Onions, tomatoes", qty: "2 kg", price: 120 }
      ]}
    ]
  },
  {
    week: 2,
    categories: [
      { name: "Protein", items: [
        { item: "Eggs", qty: "24 pcs", price: 170 },
        { item: "Fish (any local)", qty: "1 kg", price: 400 },
        { item: "Chicken (keema/curry cut)", qty: "1 kg", price: 300 },
        { item: "Milk", qty: "7 L", price: 490 },
        { item: "Soy chunks", qty: "250 g", price: 90 },
        { item: "Rajma / chole", qty: "1 kg", price: 150 }
      ]},
      { name: "Carbs", items: [
        { item: "Rice", qty: "3 kg", price: 240 },
        { item: "Whole wheat flour", qty: "2 kg", price: 110 },
        { item: "Whole wheat pasta", qty: "500 g", price: 130 },
        { item: "Poha / idli rice", qty: "1 kg", price: 90 }
      ]},
      { name: "Fats & Nuts", items: [
        { item: "Peanuts (raw/roasted)", qty: "500 g", price: 150 },
        { item: "Cashews", qty: "150 g", price: 280 },
        { item: "Ghee", qty: "500 g", price: 350 },
        { item: "Cheese (block/slices)", qty: "200 g", price: 180 }
      ]},
      { name: "Fruits & Veg", items: [
        { item: "Bananas", qty: "14 pcs", price: 140 },
        { item: "Mango (seasonal)", qty: "1 kg", price: 150 },
        { item: "Mixed vegetables", qty: "3 kg", price: 240 },
        { item: "Spinach, capsicum", qty: "1 kg", price: 100 }
      ]}
    ]
  },
  {
    week: 3,
    categories: [
      { name: "Protein", items: [
        { item: "Eggs", qty: "30 pcs", price: 210 },
        { item: "Chicken breast/mince", qty: "1.5 kg", price: 450 },
        { item: "Paneer", qty: "1 kg", price: 400 },
        { item: "Milk", qty: "7 L", price: 490 },
        { item: "Greek yogurt / thick curd", qty: "500 g", price: 180 }
      ]},
      { name: "Carbs", items: [
        { item: "Rice", qty: "3 kg", price: 240 },
        { item: "Whole wheat flour", qty: "2 kg", price: 110 },
        { item: "Oats", qty: "500 g", price: 150 },
        { item: "Pizza base / dough flour", qty: "500 g", price: 100 }
      ]},
      { name: "Fats & Nuts", items: [
        { item: "Peanut butter", qty: "1 jar (500g)", price: 350 },
        { item: "Almonds", qty: "250 g", price: 300 },
        { item: "Mixed nuts", qty: "200 g", price: 260 },
        { item: "Dates", qty: "250 g", price: 150 }
      ]},
      { name: "Fruits & Veg", items: [
        { item: "Bananas", qty: "14 pcs", price: 140 },
        { item: "Apples, oranges", qty: "1.5 kg", price: 200 },
        { item: "Mixed vegetables", qty: "3 kg", price: 240 },
        { item: "Onion, tomato, garlic", qty: "2 kg", price: 130 }
      ]}
    ]
  },
  {
    week: 4,
    categories: [
      { name: "Protein", items: [
        { item: "Eggs", qty: "24 pcs", price: 170 },
        { item: "Chicken (mixed cuts)", qty: "1.5 kg", price: 450 },
        { item: "Fish", qty: "500 g", price: 200 },
        { item: "Milk", qty: "7 L", price: 490 },
        { item: "Dal (black/mixed)", qty: "1 kg", price: 150 }
      ]},
      { name: "Carbs", items: [
        { item: "Rice", qty: "3 kg", price: 240 },
        { item: "Whole wheat flour", qty: "2 kg", price: 110 },
        { item: "Whole wheat bread", qty: "2 loaves", price: 100 },
        { item: "Besan (gram flour)", qty: "500 g", price: 70 }
      ]},
      { name: "Fats & Nuts", items: [
        { item: "Peanut butter", qty: "1 jar (500g)", price: 350 },
        { item: "Walnuts, cashews", qty: "250 g", price: 400 },
        { item: "Ghee/butter", qty: "500 g", price: 350 },
        { item: "Cocoa powder", qty: "100 g", price: 120 }
      ]},
      { name: "Fruits & Veg", items: [
        { item: "Bananas", qty: "14 pcs", price: 140 },
        { item: "Seasonal fruit", qty: "1 kg", price: 150 },
        { item: "Mixed vegetables", qty: "3 kg", price: 240 },
        { item: "Spinach, beans, carrot", qty: "1.5 kg", price: 150 }
      ]}
    ]
  }
];

/* ---------- Workout plan ---------- */

const WORKOUT_PLAN = [
  { day: "Monday", focus: "Chest & Triceps", exercises: [
    { name: "Barbell / Dumbbell Bench Press", sets: "4", reps: "8–10" },
    { name: "Incline Dumbbell Press", sets: "3", reps: "10–12" },
    { name: "Push-ups", sets: "3", reps: "To near failure" },
    { name: "Triceps Dips / Pushdowns", sets: "3", reps: "10–12" }
  ]},
  { day: "Tuesday", focus: "Back & Biceps", exercises: [
    { name: "Deadlifts", sets: "4", reps: "6–8" },
    { name: "Pull-ups / Lat Pulldown", sets: "4", reps: "8–10" },
    { name: "Barbell/Dumbbell Rows", sets: "3", reps: "10–12" },
    { name: "Bicep Curls", sets: "3", reps: "10–12" }
  ]},
  { day: "Wednesday", focus: "Legs", exercises: [
    { name: "Squats", sets: "4", reps: "8–10" },
    { name: "Leg Press / Lunges", sets: "3", reps: "10–12" },
    { name: "Romanian Deadlifts", sets: "3", reps: "10–12" },
    { name: "Calf Raises", sets: "3", reps: "15" }
  ]},
  { day: "Thursday", focus: "Rest / Mobility", exercises: [
    { name: "Light walk or stretching", sets: "-", reps: "20–30 min" }
  ]},
  { day: "Friday", focus: "Shoulders & Arms", exercises: [
    { name: "Overhead Press", sets: "4", reps: "8–10" },
    { name: "Lateral Raises", sets: "3", reps: "12–15" },
    { name: "Barbell/Dumbbell Rows", sets: "3", reps: "10–12" },
    { name: "Bicep Curls + Triceps Pushdowns", sets: "3", reps: "12" }
  ]},
  { day: "Saturday", focus: "Full Body (Compound Focus)", exercises: [
    { name: "Squats", sets: "3", reps: "8–10" },
    { name: "Deadlifts", sets: "3", reps: "6–8" },
    { name: "Bench Press", sets: "3", reps: "8–10" },
    { name: "Bent-over Rows", sets: "3", reps: "10–12" },
    { name: "Overhead Press", sets: "3", reps: "8–10" }
  ]},
  { day: "Sunday", focus: "Rest", exercises: [
    { name: "Full rest — sleep 7.5–9 hours", sets: "-", reps: "-" }
  ]}
];

const HABIT_ITEMS = [
  { key: "meal1", label: "Ate breakfast + wake-up meal" },
  { key: "meal2", label: "Ate all mid-day meals/snacks" },
  { key: "meal3", label: "Ate dinner + bedtime meal" },
  { key: "water", label: "Drank 2.5–3L water" },
  { key: "gym", label: "Trained / did today's workout" },
  { key: "sleep", label: "Slept 7.5–9 hours" }
];
