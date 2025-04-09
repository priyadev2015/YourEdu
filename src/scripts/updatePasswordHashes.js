const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// MongoDB user data with bcrypt hashes
const mongoUsers = [
  {"email":"colin@youredu.school","password":"$2a$10$Qpy6MGl.nBV9WBmSr.NZL.kHZnLBiBJMsHsMwfamD6zL.MpZMEvLi"},
  {"email":"henry@youredu.school","password":"$2a$10$WXcFw6Lx.gxenlBUYLUPJOwqM1GxRfNUtionPLsbyRtPzBQxR57pm"},
  {"email":"test@youredu.school","password":"$2a$10$5gKcX38Y3ZKk69.JwLkoLOxVIHnPOP6d1m4UfiD77xDMtkfd8xv8m"},
  {"email":"johnpjoseph1@gmail.com","password":"$2a$10$9OIQIyUf/9Mg8yI8MDOnAe3W6i/Io.sqHQtNndNsrhg16jSfrDkJa"},
  {"email":"cneuendor@gmail.com","password":"$2a$10$yw/b31/NkDKj6yA3ZxiaBOZvYrlTBe.8Et06ukoJc39b6FPYCJx/."},
  {"email":"millheightsacademy@gmail.com","password":"$2a$10$IN.VqocrAozgyg9vl1nJWu0O3nfiqiCtgZwNQp6L0hK6iSiM//STK"},
  {"email":"kdelfierro@gmail.com","password":"$2a$10$.856dD8XsIzgEEUdyD9zzeBD0KWN4Xox1GKGX9gsOH8w8D5aEoGmm"},
  {"email":"tomkim77@gmail.com","password":"$2a$10$NRHeZx4y9GlprFW940d.Ee7FaNzfXnW3ezvHoItZvk47AwCfWe8D6"},
  {"email":"java.bali.indonesia@gmail","password":"$2a$10$j0S1ZA.K717u/zoncXzYD.mmEBJ1rvBU3ZUx7wPL5X05YOhXqWqoW"},
  {"email":"rosaliconcepcion@gmail.com","password":"$2a$10$h2agmw3XleZg/Nl7mLysJOYNPV5/hFN5G9rMDZ/m15ZQNACF94uie"},
  {"email":"h.hitzeroth@gmail.com","password":"$2a$10$.V9X1gXc40Ac/4ur5ZqxnudnDFWpD84qt7pvgu67SLWKErEQ5MQxi"},
  {"email":"rachelkpoplack@gmail.com","password":"$2a$10$ITVQfKE1mXlTeXiOZErskuYKFi0eAdlWq0pIrdiDkwOX846jcxoQi"},
  {"email":"krivicichb@gmail.com","password":"$2a$10$lmoztTRYPeqGUYjB/TJvm.jQJHqc1n6JVKSZy.JAKO2A4YCJ8m5yS"},
  {"email":"aepond@gmail.com","password":"$2a$10$X9.NNuhTvHcCMKb81JYRBuvV6BY8Sx1UdpbUS/P7jl5wuGMqSDxuW"},
  {"email":"nomadterp95@yahoo.com","password":"$2a$10$k3mIQopmtjxgj61Juj2kuuI0eCFQymeZH0mjikUVLagbYNZNeuHty"},
  {"email":"karensonline@gmail.com","password":"$2a$10$MJ8jgap.KI3y8RAsesW6ZuHRLWc.9B.MN9BMYTmhDcbZc6GAHGTDq"},
  {"email":"kevandstef@gmail.com","password":"$2a$10$x.ClBI/QLDyQ.dN2TVILh.axZAgrFObzc2nke1ZQr0GZGd.mOe2wC"},
  {"email":"stephen@neuendorffer.name","password":"$2a$10$3pBWMyibzj8ucPDD4N1aDeCAqAzziLs/vtFoL/FK4alA0.RlhjFQG"},
  {"email":"tenny.calhoun@gmail.com","password":"$2a$10$wyNTYyhpq7VWIyoq6uHt7eWDuDeQHlGI/glAdSKwosp0dsqRy8N4y"},
  {"email":"itsrosette@icloud.com","password":"$2a$10$oCTGpxJfdFyoDJcTw0nmz.6S9bOGzZsGZr/ZVxHKzWYvveSkZNhLe"},
  {"email":"colleen.nguyen@gmail.com","password":"$2a$10$qEFZXhe8oXI2WqZ10eJLd./mLM1yPcsNa9WtXws/uperCKYyHVWIG"},
  {"email":"jubileelau201@gmail.com","password":"$2a$10$hpBqeZ8nL.hLTulMjNos.OUe8MwKuDmn2duqTqBnvOPncPoqCOyJm"},
  {"email":"kim.d.ly@gmail.com","password":"$2a$10$VOtQcUVEhZQ2eUyEz80yl.uaKHLuSZvkcPAn2FsRQiqDyD7rGtquO"},
  {"email":"pablo@startx.com","password":"$2a$10$VNJYG0UbDfeYHSEc1SXUB.xQGqh4eglOC4hJvKacowtO9TMXd3gMe"},
  {"email":"testing@youredu.school","password":"$2a$10$tJqDFwN2oUg68dwDFZo1quIZ3jzgzhuSB57NSKEKqr21UPuWFuUDG"},
  {"email":"awillburn@gmail.com","password":"$2a$10$TtnEeQHghLO2ZE3d344DEOmlUwFyN7UhoJcKQyxfWMClcPbjpZ2O."},
  {"email":"testing2@youredu.school","password":"$2a$10$RN4LoUaq8NpqgtZ.CkM/jeS3HV.4CThRK.pqpO2NY7WLp9gKs4pZC"},
  {"email":"testing3@youredu.school","password":"$2a$10$0Qg73J8UgHefTQVIgsYuaeTWFbsgRmnM7PXHiRR8K2Mk1QMFwb7M2"},
  {"email":"parryemma0@gmail.com","password":"$2a$10$McjxaCRPdC8wb5AM/mmOUemOsATBOMk4Zi4KiyZaTatLb.NvZtQGu"},
  {"email":"wanli.xu@gmail.com","password":"$2a$10$M1bGa2sTadQFQ5e84kSTNOXbJmrCypr24mVabOtJw1GSaqB7lqeS2"},
  {"email":"test10@youredu.school","password":"$2a$10$oNwHo85Fk0dTHwRJlHx/7.n2wHfccDcumt77VLcl7BOy9xio2S5Hq"},
  {"email":"test11@youredu.school","password":"$2a$10$24uLOVjez5ikBJANAExthenra7ceHoRidaa6EbhpdRlwroIltQQ5C"},
  {"email":"test12@youredu.school","password":"$2a$10$uEU9UySu1tiqNkb0f7oSs.Mq.217zdKhp9WD3/ptzFbDtJ7rn3RSS"},
  {"email":"test13@youredu.school","password":"$2a$10$m0ciwHlvUlTdmnE8aLAvfugvqlT6mfL6HeNfVHsYw3G83fFAcefpW"},
  {"email":"test14@youredu.school","password":"$2a$10$OXUlJz8TxA.27LaPfK.9wOvOs301LriRnyU1BIqcXnwwKgf8/T0Jq"},
  {"email":"test15@youredu.school","password":"$2a$10$ipFZYuYdzFcsVgAmFnoD1ehJxEYPSfl3IofPnl/4S4lJ1EFie7FWG"},
  {"email":"test101@youredu.school","password":"$2a$10$/vSjc0LfjEq7RPvs0p2mhOMStgTDlUVnDIE5DycwPDBrwWmKjAjZ6"},
  {"email":"klimekdl@yahoo.com","password":"$2a$10$e31CqPKtH.gpn2hTlRdG6OlkXeD9WZnAp84JXLkdnkw4Kno8ABgCC"},
  {"email":"kim.carpiuc@gmail.com","password":"$2a$10$KvGQMVoxSYHt6kmieVxo/u7EX4WC9SSDtOv/YO62uMWwfI12bNywW"}
];

async function updatePasswordHashes() {
  console.log('Starting password hash update...');
  
  for (const mongoUser of mongoUsers) {
    try {
      // Skip the two working users
      if (mongoUser.email === 'yoda@youredu.school' || mongoUser.email === 'colin-admin@youredu.school') {
        console.log(`Skipping working user: ${mongoUser.email}`);
        continue;
      }

      console.log(`Processing user: ${mongoUser.email}`);

      // Update the password hash using our custom function
      const { data, error } = await supabase.rpc('update_user_password_hash', {
        user_email: mongoUser.email,
        hashed_password: mongoUser.password
      });

      if (error) {
        console.error(`Error updating password for ${mongoUser.email}:`, error);
        continue;
      }

      console.log(`Successfully updated password hash for ${mongoUser.email}`);
    } catch (error) {
      console.error(`Unexpected error processing ${mongoUser.email}:`, error);
    }
  }

  console.log('Password hash update completed');
}

// Run the script
updatePasswordHashes().catch(console.error); 