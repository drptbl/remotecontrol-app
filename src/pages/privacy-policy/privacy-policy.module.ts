import { IonicPageModule } from 'ionic-angular';
import { NgModule } from '@angular/core';
import { PrivacyPolicyPage } from './privacy-policy';

@NgModule({
  declarations: [
    PrivacyPolicyPage,
  ],
  imports: [
    IonicPageModule.forChild(PrivacyPolicyPage),
  ],
  exports: [
    PrivacyPolicyPage,
  ],
})
export class PrivacyPolicyPageModule {}
