import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as sc from 'react-native-spatialconnect';
import scformschema from 'spatialconnect-form-schema/native';

let self;
class Form extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.state.params.form.form_label,
    headerRight: (
      <TouchableOpacity onPress={() => self.scform.onSubmit()}>
        <Text style={styles.submitBtnStyle}>Submit</Text>
      </TouchableOpacity>
    ),
  });
  constructor(props) {
    super(props);
    self = this;
    this.state = {
      submitting: false,
    };
    this.saveForm = this.saveForm.bind(this);
    this.createFeature = this.createFeature.bind(this);
  }
  saveForm(formData) {
    this.setState({ submitting: true });
    const formInfo = this.props.navigation.state.params.form;
    navigator.geolocation.getCurrentPosition(
      position => {
        const gj = {
          geometry: {
            type: 'Point',
            coordinates: [position.coords.longitude, position.coords.latitude],
          },
          properties: formData,
        };
        const f = sc.geometry('FORM_STORE', formInfo.form_key, gj);
        this.createFeature(f);
      },
      () => {
        const f = sc.spatialFeature('FORM_STORE', formInfo.form_key, { properties: formData });
        this.createFeature(f);
      },
      { enableHighAccuracy: true, timeout: 3000, maximumAge: 1000 }
    );
  }
  createFeature(f) {
    sc.createFeature$(f).first().subscribe(
        newFeature => {
          setTimeout(() => {
            this.scform.formSubmitted();
            this.setState({ submitting: false });
          }, 500);
        },
        err => {
          setTimeout(() => {
            this.scform.formSubmittedError();
            this.setState({ submitting: false });
          }, 500);
        }
      );
  }
  render() {
    const { form } = this.props.navigation.state.params;
    const { SCForm } = scformschema;
    const { submitting } = this.state;
    return (
      <SCForm
        ref={scform => {
          this.scform = scform;
        }}
        form={form}
        submitting={submitting}
        saveForm={this.saveForm}
      />
    );
  }
}

const styles = StyleSheet.create({
  submitBtnStyle: {
    paddingRight: 16,
    color: 'white',
  },
});

export default Form;
